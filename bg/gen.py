"""Generate the site's scientific background line art. Run: python3 bg/gen.py bg"""
import math, os, sys

OUT = sys.argv[1]
INK = "#c4c1bb"
SW = 1.25
os.makedirs(OUT, exist_ok=True)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


# ------------------------------------------------------------------ helix --
def helix():
    W, H = 120, 1040              # 4 whole turns, so it tiles vertically
    cx, A, P = W / 2, 34, 260          # centre, amplitude, pitch (px per turn)
    off = 0.38 * 2 * math.pi           # second strand offset: uneven grooves
    steps = 400
    s1, s2 = [], []
    for i in range(steps + 1):
        y = H * i / steps
        t = 2 * math.pi * y / P
        s1.append((cx + A * math.sin(t), y))
        s2.append((cx + A * math.sin(t + off), y))
    path = lambda pts: "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts)
    rungs = []
    n = 0
    y = 8.0
    while y < H:
        t = 2 * math.pi * y / P
        x1, x2 = cx + A * math.sin(t), cx + A * math.sin(t + off)
        if abs(x1 - x2) > 6:            # skip where the strands cross
            rungs.append(f'<line x1="{f(x1)}" y1="{f(y)}" x2="{f(x2)}" y2="{f(y)}"/>')
        y += 16
        n += 1
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<g fill="none" stroke="{INK}" stroke-linecap="round">'
            f'<g stroke-width="{SW * 0.8}" opacity="0.6">{"".join(rungs)}</g>'
            f'<path stroke-width="{SW * 1.1}" d="{path(s1)}"/>'
            f'<path stroke-width="{SW * 1.1}" d="{path(s2)}"/>'
            "</g></svg>")


# ------------------------------------------------------------- molecules --
L = 26  # bond length


class Mol:
    def __init__(self):
        self.atoms = {}   # name -> (x, y, label or None)
        self.bonds = []   # (a, b, order, side) side: +1/-1 which way a double bond's 2nd line sits

    def atom(self, name, x, y, label=None):
        self.atoms[name] = (x, y, label)

    def bond(self, a, b, order=1, inner=None):
        self.bonds.append((a, b, order, inner))

    def svg_parts(self):
        out = []
        for a, b, order, inner in self.bonds:
            x1, y1, l1 = self.atoms[a]
            x2, y2, l2 = self.atoms[b]
            dx, dy = x2 - x1, y2 - y1
            d = math.hypot(dx, dy)
            ux, uy = dx / d, dy / d
            t1 = 0.36 * L if l1 else 0
            t2 = 0.36 * L if l2 else 0
            p1 = (x1 + ux * t1, y1 + uy * t1)
            p2 = (x2 - ux * t2, y2 - uy * t2)
            out.append(f'<line x1="{f(p1[0])}" y1="{f(p1[1])}" x2="{f(p2[0])}" y2="{f(p2[1])}"/>')
            if order == 2:
                # second line: offset toward `inner` point (ring centre) or a side
                nx, ny = -uy, ux
                if inner is not None:
                    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
                    if (inner[0] - mx) * nx + (inner[1] - my) * ny < 0:
                        nx, ny = -nx, -ny
                    sh = 0.15 * L  # shorten inner line at both ends
                else:
                    sh = 0
                o = 0.17 * L
                q1 = (p1[0] + nx * o + ux * sh, p1[1] + ny * o + uy * sh)
                q2 = (p2[0] + nx * o - ux * sh, p2[1] + ny * o - uy * sh)
                out.append(f'<line x1="{f(q1[0])}" y1="{f(q1[1])}" x2="{f(q2[0])}" y2="{f(q2[1])}"/>')
        labels = []
        for x, y, lab in self.atoms.values():
            if lab:
                labels.append(f'<text x="{f(x)}" y="{f(y)}">{lab}</text>')
        return out, labels


def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy - r * math.sin(a)   # y-up angles


def adenine(ox, oy):
    m = Mol()
    hx, hy = ox, oy
    for name, ang, lab in [("C6", 90, None), ("N1", 150, "N"), ("C2", 210, None),
                           ("N3", 270, "N"), ("C4", 330, None), ("C5", 30, None)]:
        m.atom(name, *polar(hx, hy, L, ang), lab)
    # pentagon on the C4–C5 edge
    c4, c5 = m.atoms["C4"], m.atoms["C5"]
    apo = L / (2 * math.tan(math.radians(36)))
    R = L / (2 * math.sin(math.radians(36)))
    px, py = (c4[0] + c5[0]) / 2 + apo, hy
    # vertices of the pentagon going round from C5: C5, N7, C8, N9, C4
    a5 = math.degrees(math.atan2(-(c5[1] - py), c5[0] - px))
    for k, (name, lab) in enumerate([("N7", "N"), ("C8", None), ("N9", "NH")], start=1):
        m.atom(name, *polar(px, py, R, a5 - 72 * k), lab)
    m.atom("N6", *polar(m.atoms["C6"][0], m.atoms["C6"][1], L, 90), "NH₂")
    hc, pc = (hx, hy), (px, py)
    m.bond("C6", "N1", 2, hc); m.bond("N1", "C2"); m.bond("C2", "N3", 2, hc)
    m.bond("N3", "C4"); m.bond("C4", "C5", 2, hc); m.bond("C5", "C6")
    m.bond("C5", "N7"); m.bond("N7", "C8", 2, pc); m.bond("C8", "N9"); m.bond("N9", "C4")
    m.bond("C6", "N6")
    return m


def peptide(ox, oy, n=3):
    """Backbone zigzag N–Cα–C(=O)–N… with alanine-style methyl side chains."""
    m = Mol()
    dx, dy = L * math.cos(math.radians(30)), L * math.sin(math.radians(30))
    x, y = ox, oy
    up = True
    prev = None
    k = 0
    seq = []
    for r in range(n):
        seq += [("N", "N"), ("CA", None), ("C", None)]
    for i, (kind, lab) in enumerate(seq):
        name = f"{kind}{i}"
        m.atom(name, x, y, "H₂N" if i == 0 else lab)
        if prev:
            m.bond(prev, name)
        if kind == "N" and i > 0:
            m.atom(f"H{i}", x, y + L if up else y - L, "H")
            m.bond(name, f"H{i}")
        if kind == "CA":
            m.atom(f"R{i}", x, y + L if up else y - L, None)
            m.bond(name, f"R{i}")
        if kind == "C":
            oyy = y + L if up else y - L
            m.atom(f"O{i}", x, oyy, "O")
            m.bond(name, f"O{i}", 2, (x + 10, y))
        prev = name
        x += dx
        y += -dy if up else dy
        up = not up
    m.atom("OH", x, y, "OH")
    m.bond(prev, "OH")
    return m


def molecules():
    W, H = 300, 560
    parts, labels = [], []
    for mol in (adenine(95, 110), peptide(22, 400)):
        p, l = mol.svg_parts()
        parts += p
        labels += l
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<g fill="none" stroke="{INK}" stroke-width="{SW}" stroke-linecap="round">{"".join(parts)}</g>'
            f'<g fill="{INK}" font-family="ui-sans-serif, -apple-system, Helvetica, Arial, sans-serif" '
            f'font-size="13" font-weight="500" text-anchor="middle" dominant-baseline="central">{"".join(labels)}</g>'
            "</svg>")


open(os.path.join(OUT, "helix.svg"), "w").write(helix())
open(os.path.join(OUT, "molecules.svg"), "w").write(molecules())
print("ok")
