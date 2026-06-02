import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Image } from "react-native";

// Largura máxima de upload. Fotos maiores são redimensionadas (mantendo proporção);
// menores não sofrem upscale. Sempre recomprime para JPEG para reduzir o tamanho.
const MAX_WIDTH = 1280;
const COMPRESS = 0.6;

const getWidth = (uri: string): Promise<number> =>
  new Promise((resolve) => {
    Image.getSize(
      uri,
      (width) => resolve(width),
      () => resolve(0),
    );
  });

/**
 * Comprime/redimensiona uma imagem antes do upload para aliviar banda e o backend.
 * Em caso de qualquer falha, retorna a URI original (best-effort, nunca quebra o fluxo).
 */
export async function compressImageForUpload(uri: string): Promise<string> {
  try {
    const width = await getWidth(uri);
    const actions =
      width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
    const result = await manipulateAsync(uri, actions, {
      compress: COMPRESS,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch (error) {
    console.warn("Image compression failed, using original:", error);
    return uri;
  }
}
