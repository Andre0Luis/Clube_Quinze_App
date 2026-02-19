import os
from PIL import Image

# Configurações
INPUT_FOLDER = "screenshots"  # Pasta com as imagens originais
OUTPUT_FOLDER = "screenshots_export"  # Pasta de saída
BACKGROUND_COLOR = (255, 255, 255)  # Branco. Use (0,0,0) para preto.

# Tamanhos exigidos (largura, altura)
SIZES = [
    (1242, 2688),  # vertical
    (2688, 1242),  # horizontal
    (1284, 2778),  # vertical
    (2778, 1284),  # horizontal
]

def process_image(img_path):
    img_name = os.path.splitext(os.path.basename(img_path))[0]
    with Image.open(img_path) as img:
        img = img.convert("RGBA")
        for width, height in SIZES:
            # Calcula escala proporcional
            ratio = min(width / img.width, height / img.height)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            resized_img = img.resize(new_size, Image.LANCZOS)

            # Cria canvas de fundo
            background = Image.new("RGBA", (width, height), BACKGROUND_COLOR + (255,))
            offset = ((width - new_size[0]) // 2, (height - new_size[1]) // 2)
            background.paste(resized_img, offset, resized_img if resized_img.mode == "RGBA" else None)

            # Salva com nome adequado
            out_name = f"{img_name}_{width}x{height}.png"
            out_path = os.path.join(OUTPUT_FOLDER, out_name)
            background.convert("RGB").save(out_path, "PNG", quality=100, optimize=True)
            print(f"Exported: {out_path}")

def main():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    for fname in os.listdir(INPUT_FOLDER):
        if fname.lower().endswith((".png", ".jpg", ".jpeg")):
            process_image(os.path.join(INPUT_FOLDER, fname))

if __name__ == "__main__":
    main()
