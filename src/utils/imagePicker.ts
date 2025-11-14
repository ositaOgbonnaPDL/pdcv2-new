/**
 * Image picker utilities
 * Handles camera and gallery image selection
 */

import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  CameraOptions,
  ImageLibraryOptions,
  Asset,
} from 'react-native-image-picker';
import {ensurePermission} from './permissions';

/**
 * Image picker options
 */
export interface ImageOptions {
  mediaType?: 'photo' | 'video' | 'mixed';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  includeBase64?: boolean;
  multiple?: boolean;
}

/**
 * Selected image result
 */
export interface SelectedImage {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  width?: number;
  height?: number;
  base64?: string;
}

/**
 * Convert Asset to SelectedImage
 */
const assetToImage = (asset: Asset): SelectedImage => ({
  uri: asset.uri || '',
  fileName: asset.fileName,
  fileSize: asset.fileSize,
  type: asset.type,
  width: asset.width,
  height: asset.height,
  base64: asset.base64,
});

/**
 * Launch camera to take a photo
 */
export const takePhoto = async (
  options: ImageOptions = {},
): Promise<SelectedImage | null> => {
  try {
    // Check camera permission
    const hasPermission = await ensurePermission('camera');
    if (!hasPermission) {
      return null;
    }

    const cameraOptions: CameraOptions = {
      mediaType: options.mediaType || 'photo',
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      quality: options.quality || 0.8,
      includeBase64: options.includeBase64 || false,
      saveToPhotos: true,
    };

    const response: ImagePickerResponse = await launchCamera(cameraOptions);

    if (response.didCancel) {
      return null;
    }

    if (response.errorCode || response.errorMessage) {
      console.error('Camera error:', response.errorMessage);
      return null;
    }

    const asset = response.assets?.[0];
    if (!asset) {
      return null;
    }

    return assetToImage(asset);
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

/**
 * Launch image library to select photo(s)
 */
export const selectPhoto = async (
  options: ImageOptions = {},
): Promise<SelectedImage | SelectedImage[] | null> => {
  try {
    // Check photo library permission
    const hasPermission = await ensurePermission('photoLibrary');
    if (!hasPermission) {
      return null;
    }

    const libraryOptions: ImageLibraryOptions = {
      mediaType: options.mediaType || 'photo',
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      quality: options.quality || 0.8,
      includeBase64: options.includeBase64 || false,
      selectionLimit: options.multiple ? 0 : 1, // 0 = unlimited
    };

    const response: ImagePickerResponse =
      await launchImageLibrary(libraryOptions);

    if (response.didCancel) {
      return null;
    }

    if (response.errorCode || response.errorMessage) {
      console.error('Image library error:', response.errorMessage);
      return null;
    }

    const assets = response.assets;
    if (!assets || assets.length === 0) {
      return null;
    }

    if (options.multiple) {
      return assets.map(assetToImage);
    }

    return assetToImage(assets[0]);
  } catch (error) {
    console.error('Error selecting photo:', error);
    return null;
  }
};

/**
 * Show action sheet to choose between camera and gallery
 */
export const pickImage = async (
  options: ImageOptions = {},
): Promise<SelectedImage | null> => {
  // This would typically show an ActionSheet, but for simplicity,
  // we'll just launch the image library
  // You can enhance this with react-native ActionSheet or similar
  return (await selectPhoto(options)) as SelectedImage | null;
};
