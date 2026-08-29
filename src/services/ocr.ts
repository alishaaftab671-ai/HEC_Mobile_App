import TextRecognition from '@react-native-ml-kit/text-recognition';

/** Runs on-device ML Kit text recognition for a local image URI. */
export async function extractTextFromImage(uri: string): Promise<string> {
  const result = await TextRecognition.recognize(uri);
  return result.text.trim();
}
