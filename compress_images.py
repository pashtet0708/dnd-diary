#!/usr/bin/env python3
"""
Сжимает картинки для веба: PNG/JPG -> WebP.
- Берёт все .png/.jpg/.jpeg из папки images/
- Ужимает до ширины <= MAXW и сохраняет рядом как .webp
- Оригинал убирает в images/_original/ (на всякий случай)
Запуск:  python compress_images.py
Нужен один раз:  pip install pillow
"""
from PIL import Image
import os, shutil

IMG_DIR = os.path.join(os.path.dirname(__file__), "images")
MAXW = 1280      # максимальная ширина (хватает с запасом)
QUALITY = 80     # 0-100, выше = лучше и тяжелее

def main():
    backup = os.path.join(IMG_DIR, "_original")
    os.makedirs(backup, exist_ok=True)
    before = after = 0
    done = 0
    for f in sorted(os.listdir(IMG_DIR)):
        ext = os.path.splitext(f)[1].lower()
        if ext not in (".png", ".jpg", ".jpeg"):
            continue
        src = os.path.join(IMG_DIR, f)
        out = os.path.join(IMG_DIR, os.path.splitext(f)[0] + ".webp")
        before += os.path.getsize(src)
        im = Image.open(src).convert("RGB")
        if im.size[0] > MAXW:
            h = round(im.size[1] * MAXW / im.size[0])
            im = im.resize((MAXW, h), Image.LANCZOS)
        im.save(out, "WEBP", quality=QUALITY, method=6)
        after += os.path.getsize(out)
        shutil.move(src, os.path.join(backup, f))
        print(f"  {f}  ->  {os.path.basename(out)}   {os.path.getsize(out)/1024:.0f} KB")
        done += 1
    if done:
        print(f"\nГотово: {done} шт.   {before/1024/1024:.1f} MB -> {after/1024/1024:.1f} MB")
        print("В entries.js указывай картинки с расширением .webp")
    else:
        print("Новых .png/.jpg в images/ не нашлось — нечего сжимать.")

if __name__ == "__main__":
    main()
