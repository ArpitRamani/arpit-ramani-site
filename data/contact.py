"""Build contact.json, the background, from the SpCas9 DCA coupling matrix
behind my insertion-tolerance model (mean-field DCA, APC-corrected,
5,254-sequence alignment).

    python3 data/contact.py ~/Desktop/insertion-tolerance-ml/data/cas9/dca_matrix.npz

The 1311x1311 matrix is max-pooled into NxN blocks, each value scaled to
0..1 between the 70th and 99.5th percentile, so most of the map is empty
and only real couplings show. `v` is the matrix row by row, one base-36
character (0-z) per block.
"""
import json, os, sys
import numpy as np

N = 120
m = np.nan_to_num(np.load(os.path.expanduser(sys.argv[1]))["apc"])
np.fill_diagonal(m, 0)
n = m.shape[0] // N * N
blk = m[:n, :n].reshape(N, n // N, N, n // N).max(axis=(1, 3))
blk = np.maximum(blk, blk.T)
lo, hi = np.percentile(blk, 70), np.percentile(blk, 99.5)
q = np.rint(np.clip((blk - lo) / (hi - lo), 0, 1) * 35).astype(int)
digits = "0123456789abcdefghijklmnopqrstuvwxyz"
out = {"N": N, "v": "".join(digits[x] for x in q.ravel())}
here = os.path.dirname(os.path.abspath(__file__))
json.dump(out, open(os.path.join(here, "..", "contact.json"), "w"), separators=(",", ":"))
print("wrote contact.json")
