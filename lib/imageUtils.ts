// Image processing utilities
import * as ImageManipulator from 'expo-image-manipulator';

interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const processImageForUpload = async (
  uri: string,
  options: ImageProcessOptions = {}
): Promise<string> => {
  const { maxWidth, maxHeight, quality } = options;
  const actions: ImageManipulator.Action[] = [];

  if (maxWidth || maxHeight) {
    actions.push({ resize: { width: maxWidth, height: maxHeight } });
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality ?? 1,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
};

export const validateImageFile = (uri: string): boolean => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerUri = uri.toLowerCase();
  return validExtensions.some((ext) => lowerUri.includes(ext));
};
