import * as ImageManipulator from 'expo-image-manipulator';
import { processImageForUpload } from '../imageUtils';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'processed-uri' }),
  SaveFormat: { JPEG: 'jpeg' },
}));

describe('processImageForUpload', () => {
  beforeEach(() => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockClear();
  });

  it('resizes images when max dimensions are provided', async () => {
    await processImageForUpload('test-uri', { maxWidth: 100, maxHeight: 200 });
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'test-uri',
      [{ resize: { width: 100, height: 200 } }],
      expect.objectContaining({ compress: 1 })
    );
  });

  it('applies quality to compression', async () => {
    await processImageForUpload('test-uri', { quality: 0.5 });
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'test-uri',
      [],
      expect.objectContaining({ compress: 0.5 })
    );
  });
});
