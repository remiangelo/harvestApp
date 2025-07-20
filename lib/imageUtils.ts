// Image processing utilities
// TODO: Install expo-image-manipulator for image compression and resizing

interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const processImageForUpload = async (
  uri: string,
  options: ImageProcessOptions = {}
): Promise<string> => {
  // For now, return the original URI
  // TODO: Implement image processing when expo-image-manipulator is installed
  return uri;
};

export const validateImageFile = (uri: string): boolean => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerUri = uri.toLowerCase();
  return validExtensions.some(ext => lowerUri.includes(ext));
};