#!/usr/bin/env python3
"""Generate Android launcher icons from the uploaded neon shield image."""
from PIL import Image, ImageDraw, ImageOps
import base64, os

SRC = "/home/z/my-project/upload/1792482719704.jpg"
RES = "/home/z/my-project/android/app/src/main/res"
OUT_SPLASH = "/home/z/my-project/public/appicon-splash.jpg"

img = Image.open(SRC).convert("RGB")
print("source:", img.size)

# ── 1) Legacy launcher icons (square with slight rounded corners) ──
DENSITIES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for d, size in DENSITIES.items():
    icon = img.resize((size, size), Image.LANCZOS)
    # rounded-corner mask (subtle, like legacy icons)
    radius = int(size * 0.18)
    mask = Image.new("L", (size, size), 0)
    dr = ImageDraw.Draw(mask)
    dr.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    path = os.path.join(RES, f"mipmap-{d}", "ic_launcher.png")
    out.save(path, "PNG", optimize=True)
    print("✓", path, out.size)

# ── 2) Round launcher icon ──
for d, size in DENSITIES.items():
    icon = img.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    dr = ImageDraw.Draw(mask)
    dr.ellipse([0, 0, size - 1, size - 1], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    path = os.path.join(RES, f"mipmap-{d}", "ic_launcher_round.png")
    out.save(path, "PNG", optimize=True)
    print("✓", path, out.size)

# ── 3) Splash-screen icon (embedded base64 in HTML) ──
splash = img.resize((220, 220), Image.LANCZOS)
splash.save(OUT_SPLASH, "JPEG", quality=84, optimize=True)
b64 = base64.b64encode(open(OUT_SPLASH, "rb").read()).decode()
os.makedirs("/home/z/my-project/android/assets-src", exist_ok=True)
with open("/home/z/my-project/android/assets-src/appicon.b64", "w") as f:
    f.write(b64)
print("✓ splash icon:", OUT_SPLASH, len(b64)//1024, "KB base64")
