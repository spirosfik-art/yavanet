# AI upscale (Real-ESRGAN x4plus via spandrel), σε tiles, για τις φωτογραφίες της παρουσίασης.
# Χρήση: python upscale.py weights.pth in.jpg out.jpg <μακριά πλευρά σε px>
import sys, torch, numpy as np
from PIL import Image
from spandrel import ModelLoader
w, inp, out, target = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
torch.set_num_threads(4)
model = ModelLoader().load_from_file(w).eval()
src = Image.open(inp).convert("RGB")
img = np.asarray(src).astype(np.float32) / 255
H, W, _ = img.shape
t = torch.from_numpy(img).permute(2, 0, 1)[None]
S, T, P = 4, 192, 16
res = torch.zeros(1, 3, H * S, W * S)
for y in range(0, H, T):
    for x in range(0, W, T):
        y0, x0 = max(y - P, 0), max(x - P, 0)
        y1, x1 = min(y + T + P, H), min(x + T + P, W)
        with torch.no_grad():
            o = model(t[:, :, y0:y1, x0:x1])
        ye, xe = min(y + T, H), min(x + T, W)
        res[:, :, y*S:ye*S, x*S:xe*S] = o[:, :, (y-y0)*S:(ye-y0)*S, (x-x0)*S:(xe-x0)*S]
    print(f"{inp}: {min(y+T,H)}/{H}", flush=True)
up = Image.fromarray((res[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255).round().astype(np.uint8))
# λίγη από την αρχική υφή, ώστε να μη «πλαστικοποιείται» η εικόνα
lz = src.resize(up.size, Image.LANCZOS)
up = Image.blend(up, lz, 0.2)
k = target / max(up.size)
if abs(k - 1) > 0.01:
    up = up.resize((round(up.size[0] * k), round(up.size[1] * k)), Image.LANCZOS)
up.save(out, "JPEG", quality=86, optimize=True, progressive=True)
print("done", out, up.size)
