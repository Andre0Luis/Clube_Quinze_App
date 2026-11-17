#!/usr/bin/env python3
"""
Gera TODOS os ícones do app a partir do ícone mestre de 1024 px (círculo "Quinze Clube"), sem a borda branca:

  - assets/images/icon.png ................ círculo com fundo TRANSPARENTE (1024)
  - assets/images/android-adaptive-foreground.png  círculo a 66% (zona segura do ícone adaptativo), fundo transparente
  - android/.../mipmap-*/ic_launcher_foreground.webp  idem, nas densidades do Android
  - android/.../mipmap-*/ic_launcher.webp ... círculo transparente (ícone legado, Android < 8)
  - android/.../mipmap-anydpi-v26/ic_launcher*.xml  ícone adaptativo (fundo = azul-marinho do anel)
  - ios/.../App-Icon-1024x1024@1x.png ..... a App Store EXIGE fundo opaco: o círculo vai sobre o azul-marinho do anel

Uso: python3 scripts/assets/generate-icons.py [caminho-do-mestre.png]
O mestre padrão é assets/branding/icon-master-1024.png (arte original, com cantos brancos). Para usar uma arte nova, passe o PNG (1024 px).
Requer Pillow.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
NAVY = (0, 5, 61)  # #00053D: cor do anel externo e da marca
MASTER = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets/branding/icon-master-1024.png"
SS = 4  # supersampling do recorte (bordas suaves)


def measure_circle(img: Image.Image):
    """(centro_x, centro_y, raio) do anel azul-marinho. A arte não é um círculo perfeito (varia ~2 px), então o raio é
    medido em 360 ângulos, de dentro para fora, e vale o MENOR: o recorte nunca passa do anel e o halo branco some."""
    import math

    px = img.convert("RGB").load()
    w, h = img.size

    def is_navy(x, y):
        r, g, b = px[x, y]
        return r < 60 and g < 60 and b < 110

    def edge_extents():
        def first(coords):
            for i, (x, y) in enumerate(coords):
                if is_navy(x, y):
                    return i
            raise SystemExit("não achei o anel azul-marinho; o mestre precisa ser o círculo")
        top = first([(w // 2, y) for y in range(h)])
        bottom = first([(w // 2, h - 1 - y) for y in range(h)])
        left = first([(x, h // 2) for x in range(w)])
        right = first([(w - 1 - x, h // 2) for x in range(w)])
        return (left + (w - 1 - right)) / 2, (top + (h - 1 - bottom)) / 2

    cx, cy = edge_extents()
    radii = []
    for deg in range(360):
        a = math.radians(deg)
        last_navy = None
        # do raio 45% do lado para fora: o último pixel azul-marinho em cada direção é o limite externo do anel
        for r10 in range(int(w * 0.45 * 10), int(w * 0.5 * 10) + 30):
            r = r10 / 10
            x, y = round(cx + r * math.cos(a)), round(cy + r * math.sin(a))
            if 0 <= x < w and 0 <= y < h and is_navy(x, y):
                last_navy = r
        if last_navy is not None:
            radii.append(last_navy)
    return cx, cy, min(radii)


def make_circle(master: Image.Image) -> Image.Image:
    """Círculo com fundo transparente, justo ao anel (corta 1,5 px para tirar o halo branco do anti-aliasing)."""
    master = master.convert("RGBA")
    w, h = master.size
    cx, cy, radius = measure_circle(master)
    radius -= 2.0
    mask = Image.new("L", (w * SS, h * SS), 0)
    ImageDraw.Draw(mask).ellipse(
        ((cx + 0.5 - radius) * SS, (cy + 0.5 - radius) * SS, (cx + 0.5 + radius) * SS, (cy + 0.5 + radius) * SS), fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)
    # A cor "escondida" sob a transparência vira azul-marinho (e não o branco do mestre): ao redimensionar, o Pillow mistura
    # essas cores com as da borda; com branco aparece um fiozinho claro no ícone pequeno.
    out = Image.new("RGBA", (w, h), NAVY + (255,))
    out.paste(master, (0, 0), mask)
    out.putalpha(mask)
    box = (round(cx + 0.5 - radius), round(cy + 0.5 - radius), round(cx + 0.5 + radius), round(cy + 0.5 + radius))
    return out.crop(box).resize((1024, 1024), Image.LANCZOS)


def on_canvas(circle: Image.Image, canvas: int, ratio: float) -> Image.Image:
    """Círculo centralizado ocupando `ratio` do lado do canvas transparente."""
    size = round(canvas * ratio)
    out = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    out.paste(circle.resize((size, size), Image.LANCZOS), ((canvas - size) // 2, (canvas - size) // 2))
    return out


def save_webp(img: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", lossless=True, method=6)


def main():
    circle = make_circle(Image.open(MASTER))

    # Expo: ícone geral e primeiro plano do ícone adaptativo
    circle.save(ROOT / "assets/images/icon.png", optimize=True)
    on_canvas(circle, 1024, 0.66).save(ROOT / "assets/images/android-adaptive-foreground.png", optimize=True)

    # iOS: sem transparência (exigência da App Store); o fundo é o azul-marinho do próprio anel
    ios = Image.new("RGB", (1024, 1024), NAVY)
    ios.paste(circle, (0, 0), circle)
    ios.save(ROOT / "ios/ClubeQuinzeApp/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png", optimize=True)

    # Android nativo
    res = ROOT / "android/app/src/main/res"
    densities = {"mdpi": (48, 108), "hdpi": (72, 162), "xhdpi": (96, 216), "xxhdpi": (144, 324), "xxxhdpi": (192, 432)}
    for name, (legacy, adaptive) in densities.items():
        folder = res / f"mipmap-{name}"
        save_webp(circle.resize((legacy, legacy), Image.LANCZOS), folder / "ic_launcher.webp")
        save_webp(circle.resize((legacy, legacy), Image.LANCZOS), folder / "ic_launcher_round.webp")
        save_webp(on_canvas(circle, adaptive, 0.66), folder / "ic_launcher_foreground.webp")

    adaptive_xml = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
        '  <background android:drawable="@color/iconBackground"/>\n'
        '  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
        "</adaptive-icon>\n"
    )
    for xml in ("ic_launcher.xml", "ic_launcher_round.xml"):
        target = res / "mipmap-anydpi-v26" / xml
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(adaptive_xml)

    colors = res / "values/colors.xml"
    text = colors.read_text()
    text = text.replace('<color name="iconBackground">#ffffff</color>', '<color name="iconBackground">#00053D</color>')
    colors.write_text(text)
    cx, cy, radius = measure_circle(Image.open(MASTER))
    print("Ícones gerados (círculo do mestre: centro %.1f,%.1f raio %.1f px)." % (cx, cy, radius))


if __name__ == "__main__":
    main()
