"""Build contact.json, the background band, from the SpCas9 DCA coupling
matrix behind my insertion-tolerance model (mean-field DCA, APC-corrected,
5,254-sequence alignment).

    python3 data/contact.py ~/Desktop/insertion-tolerance-ml/data/cas9/dca_matrix.npz

The 1311x1311 matrix is max-pooled into BxB blocks and only the band within
BAND blocks of the diagonal is kept, each value scaled to 0..1 between the
40th and 99.5th percentile. Row k of `v` is diagonal d = k + 1.
"""
import json, os, sys
import numpy as np

B, BAND = 90, 16
m = np.nan_to_num(np.load(os.path.expanduser(sys.argv[1]))["apc"])
np.fill_diagonal(m, 0)
n = m.shape[0] // B * B
blk = m[:n, :n].reshape(B, n // B, B, n // B).max(axis=(1, 3))
blk = np.maximum(blk, blk.T)
lo, hi = np.percentile(blk, 40), np.percentile(blk, 99.5)
v = np.clip((blk - lo) / (hi - lo), 0, 1)
out = {"B": B, "v": [[round(float(v[i, i + d]), 2) for i in range(B - d)] for d in range(1, BAND + 1)]}
here = os.path.dirname(os.path.abspath(__file__))
json.dump(out, open(os.path.join(here, "..", "contact.json"), "w"), separators=(",", ":"))
print("wrote contact.json")
