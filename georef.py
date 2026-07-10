#!/usr/bin/env python3
"""Georeference an old tract-map scan against modern OSM street geometry.

Workflow (see TRACT-RESEARCH.md):
  1. pdftoppm -png -r 150 tracts/MR066-035.pdf /tmp/mr66_35
  2. python3 georef.py grid /tmp/mr66_35-1.png
       -> writes /tmp/mr66_35-1-grid.png with a labeled pixel grid.
       Read it, identify 2+ intersections you can name confidently
       (streets whose names HAVEN'T changed), estimate their pixel coords.
  3. Get modern lat/lng for those intersections:  node intersect.js "A" "B"
  4. Write a control file (JSON):
       { "image": "/tmp/mr66_35-1.png",
         "points": [
           {"px": [1310, 2270], "ll": [34.05731, -118.26343], "note": "Bixel x 3rd"},
           {"px": [ 585, 1810], "ll": [34.05582, -118.26150], "note": "Boylston x 3rd"} ] }
  5. python3 georef.py fit control.json      -> transform + residuals (m)
  6. python3 georef.py overlay control.json  -> <image>-overlay.png with
       modern streets drawn/labeled on the scan; Read it and compare.
  7. python3 georef.py locate control.json X Y -> nearest modern streets
       to pixel (X,Y): name the modern identity of an old label.

2 control points -> similarity (rotation+scale); 3+ -> full affine (better;
absorbs paper stretch). Residuals over ~15 m mean a bad point: re-check px.
"""
import json, math, re, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

def load_geometry():
    src = open(os.path.join(HERE, "streets-geometry.js")).read()
    body = src[src.index("=") + 1:].strip().rstrip(";").strip()
    g = json.loads(body)
    return (g.get("data") or g)["elements"]

def normalize(name):
    return re.sub(r"^(North|South|East|West|N\.?|S\.?|E\.?|W\.?)\s+", "", name, flags=re.I)

# local planar coords (meters) around a reference lat/lon
def make_proj(lat0, lon0):
    kx = 111320.0 * math.cos(math.radians(lat0))
    ky = 110540.0
    def to_en(lat, lon): return ((lon - lon0) * kx, (lat - lat0) * ky)
    def to_ll(e, n): return (lat0 + n / ky, lon0 + e / kx)
    return to_en, to_ll

def load_control(path):
    c = json.load(open(path))
    pts = c["points"]
    if len(pts) < 2: sys.exit("need at least 2 control points")
    lat0 = sum(p["ll"][0] for p in pts) / len(pts)
    lon0 = sum(p["ll"][1] for p in pts) / len(pts)
    to_en, to_ll = make_proj(lat0, lon0)
    return c, pts, to_en, to_ll

def fit_transform(pts, to_en):
    """Return 2x3 matrix M mapping pixel (x, -y, 1) -> (E, N). Pixel y is
    negated first so both systems are right-handed."""
    P = np.array([[p["px"][0], -p["px"][1]] for p in pts], float)
    Q = np.array([to_en(p["ll"][0], p["ll"][1]) for p in pts], float)
    if len(pts) == 2:
        # exact similarity from 2 points: solve for a,b,tx,ty in
        # E = a*x - b*y' ... standard complex-number form
        z0, z1 = complex(*P[0]), complex(*P[1])
        w0, w1 = complex(*Q[0]), complex(*Q[1])
        s = (w1 - w0) / (z1 - z0)
        t = w0 - s * z0
        M = np.array([[s.real, -s.imag, t.real], [s.imag, s.real, t.imag]])
    else:
        A = np.hstack([P, np.ones((len(pts), 1))])
        M = np.linalg.lstsq(A, Q, rcond=None)[0].T  # 2x3
    return M

def apply_M(M, x, y):
    v = np.array([x, -y, 1.0])
    return M @ v  # (E, N)

def invert_M(M):
    A = M[:, :2]; t = M[:, 2]
    Ai = np.linalg.inv(A)
    def en_to_px(e, n):
        p = Ai @ (np.array([e, n]) - t)
        return p[0], -p[1]
    return en_to_px

def residuals(M, pts, to_en):
    out = []
    for p in pts:
        e, n = apply_M(M, *p["px"])
        E, N = to_en(p["ll"][0], p["ll"][1])
        out.append((p.get("note", "?"), math.hypot(e - E, n - N)))
    return out

def cmd_grid(img_path, step=200):
    im = Image.open(img_path).convert("RGB")
    d = ImageDraw.Draw(im)
    font = get_font(22)
    for x in range(0, im.width, step):
        d.line([(x, 0), (x, im.height)], fill=(0, 160, 255), width=1)
        for y in range(0, im.height, step):
            d.line([(0, y), (im.width, y)], fill=(0, 160, 255), width=1)
            d.text((x + 4, y + 3), f"{x},{y}", fill=(0, 90, 200), font=font)
    out = img_path.rsplit(".", 1)[0] + "-grid.png"
    im.save(out); print("wrote", out, f"({im.width}x{im.height}, grid every {step}px)")

def get_font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def cmd_fit(ctrl_path, quiet=False):
    c, pts, to_en, to_ll = load_control(ctrl_path)
    M = fit_transform(pts, to_en)
    res = residuals(M, pts, to_en)
    if not quiet:
        kind = "similarity (2 pts)" if len(pts) == 2 else f"affine ({len(pts)} pts, least squares)"
        print(f"fit: {kind}")
        for note, r in res: print(f"  residual {r:7.1f} m   {note}")
        px_scale = math.hypot(*M[:, 0])  # meters per pixel
        print(f"  scale: {px_scale:.2f} m/pixel; " +
              ("OK" if all(r < 15 for _, r in res) else "⚠ residual over 15 m — recheck that point"))
    return c, pts, M, to_en, to_ll

def cmd_locate(ctrl_path, x, y):
    c, pts, M, to_en, to_ll = cmd_fit(ctrl_path, quiet=True)
    e, n = apply_M(M, x, y)
    lat, lon = to_ll(e, n)
    print(f"pixel ({x},{y}) -> lat {lat:.5f}, lon {lon:.5f}")
    best = {}
    for w in load_geometry():
        if "geometry" not in w or "name" not in w.get("tags", {}): continue
        name = normalize(w["tags"]["name"])
        for a, b in zip(w["geometry"], w["geometry"][1:]):
            d = seg_dist(to_en, e, n, a, b)
            if d < best.get(name, 1e9): best[name] = d
    for name, d in sorted(best.items(), key=lambda kv: kv[1])[:4]:
        print(f"  {d:7.1f} m   {name}")

def seg_dist(to_en, e, n, a, b):
    ax, ay = to_en(a["lat"], a["lon"]); bx, by = to_en(b["lat"], b["lon"])
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = 0 if L2 == 0 else max(0, min(1, ((e - ax) * dx + (n - ay) * dy) / L2))
    return math.hypot(e - (ax + t * dx), n - (ay + t * dy))

def cmd_overlay(ctrl_path):
    c, pts, M, to_en, to_ll = cmd_fit(ctrl_path)
    en_to_px = invert_M(M)
    im = Image.open(c["image"]).convert("RGB")
    d = ImageDraw.Draw(im)
    font = get_font(30)
    label_at = {}  # name -> pixel midpoint candidate
    for w in load_geometry():
        if "geometry" not in w or "name" not in w.get("tags", {}): continue
        name = normalize(w["tags"]["name"])
        pxs = []
        for pt in w["geometry"]:
            e, n = to_en(pt["lat"], pt["lon"])
            pxs.append(en_to_px(e, n))
        if not any(-200 <= x <= im.width + 200 and -200 <= y <= im.height + 200 for x, y in pxs):
            continue
        d.line([tuple(map(float, p)) for p in pxs], fill=(220, 30, 30), width=4)
        mid = pxs[len(pxs) // 2]
        if 0 <= mid[0] <= im.width and 0 <= mid[1] <= im.height:
            label_at.setdefault(name, mid)
    for name, (x, y) in label_at.items():
        d.text((x + 6, y + 6), name, fill=(160, 0, 200), font=font,
               stroke_width=2, stroke_fill=(255, 255, 255))
    for p in pts:  # control points as green crosses
        x, y = p["px"]
        d.line([(x - 20, y), (x + 20, y)], fill=(0, 170, 0), width=5)
        d.line([(x, y - 20), (x, y + 20)], fill=(0, 170, 0), width=5)
    out = c["image"].rsplit(".", 1)[0] + "-overlay.png"
    im.save(out); print("wrote", out)

def cmd_trace(ctrl_path, x1, y1, x2, y2, n=9):
    """Sample n points along a drawn street line (pixel endpoints) and vote."""
    c, pts, M, to_en, to_ll = cmd_fit(ctrl_path, quiet=True)
    geom = load_geometry()
    votes = {}
    for i in range(n):
        t = i / (n - 1)
        e, nn = apply_M(M, x1 + t * (x2 - x1), y1 + t * (y2 - y1))
        best = {}
        for w in geom:
            if "geometry" not in w or "name" not in w.get("tags", {}): continue
            name = normalize(w["tags"]["name"])
            for a, b in zip(w["geometry"], w["geometry"][1:]):
                d = seg_dist(to_en, e, nn, a, b)
                if d < best.get(name, 1e9): best[name] = d
        for rank, (name, d) in enumerate(sorted(best.items(), key=lambda kv: kv[1])[:2]):
            v = votes.setdefault(name, {"n1": 0, "ds": []})
            if rank == 0: v["n1"] += 1
            v["ds"].append(d)
    print(f"trace ({x1},{y1})->({x2},{y2}), {n} samples — nearest-street votes:")
    for name, v in sorted(votes.items(), key=lambda kv: (-kv[1]["n1"], min(kv[1]["ds"]))):
        ds = v["ds"]
        print(f"  {v['n1']:2d}/{n} first place   median {sorted(ds)[len(ds)//2]:6.1f} m   {name}")

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args: sys.exit(__doc__)
    if args[0] == "grid": cmd_grid(args[1], int(args[2]) if len(args) > 2 else 200)
    elif args[0] == "fit": cmd_fit(args[1])
    elif args[0] == "overlay": cmd_overlay(args[1])
    elif args[0] == "locate": cmd_locate(args[1], float(args[2]), float(args[3]))
    elif args[0] == "trace": cmd_trace(args[1], *map(float, args[2:6]), n=int(args[6]) if len(args) > 6 else 9)
    else: sys.exit(__doc__)
