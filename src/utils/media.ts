/**
 * Media Utilities
 * Handles media files (images, audio) compression, validation, and management
 */

import * as RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {MediaFile} from '../types/form';

/**
 * Media quality settings
 */
export type MediaQuality = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Get quality value (0-1) from quality setting
 */
export const getQualityValue = (quality: MediaQuality): number => {
  switch (quality) {
    case 'LOW':
      return 0.5;
    case 'MEDIUM':
      return 0.7;
    case 'HIGH':
      return 0.9;
    default:
      return 0.7;
  }
};

/**
 * Get max dimensions based on quality
 */
export const getMaxDimensions = (
  quality: MediaQuality,
): {maxWidth: number; maxHeight: number} => {
  switch (quality) {
    case 'LOW':
      return {maxWidth: 800, maxHeight: 800};
    case 'MEDIUM':
      return {maxWidth: 1200, maxHeight: 1200};
    case 'HIGH':
      return {maxWidth: 1920, maxHeight: 1920};
    default:
      return {maxWidth: 1200, maxHeight: 1200};
  }
};

/**
 * Convert bytes to human-readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file size is within limit
 */
export const isFileSizeValid = (
  fileSize: number,
  maxSizeInBytes: number,
): boolean => {
  return fileSize <= maxSizeInBytes;
};

/**
 * Get file extension from URI
 */
export const getFileExtension = (uri: string): string => {
  const parts = uri.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Check if file is an image
 */
export const isImage = (uri: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(uri);
  return imageExtensions.includes(extension);
};

/**
 * Check if file is audio
 */
export const isAudio = (uri: string): boolean => {
  const audioExtensions = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];
  const extension = getFileExtension(uri);
  return audioExtensions.includes(extension);
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (uri: string): string => {
  const extension = getFileExtension(uri);

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (
  prefix: string = 'file',
  extension: string = 'jpg',
): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}.${extension}`;
};

/**
 * Get app's document directory path
 */
export const getDocumentDirectory = (): string => {
  return Platform.OS === 'ios'
    ? RNFS.DocumentDirectoryPath
    : RNFS.ExternalDirectoryPath || RNFS.DocumentDirectoryPath;
};

/**
 * Get app's cache directory path
 */
export const getCacheDirectory = (): string => {
  return RNFS.CachesDirectoryPath;
};

/**
 * Create directory if it doesn't exist
 */
export const ensureDirectoryExists = async (path: string): Promise<void> => {
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
};

/**
 * Save file to app directory
 */
export const saveFile = async (
  sourceUri: string,
  destinationPath: string,
): Promise<string> => {
  try {
    // Ensure destination directory exists
    const directory = destinationPath.substring(
      0,
      destinationPath.lastIndexOf('/'),
    );
    await ensureDirectoryExists(directory);

    // Copy file
    await RNFS.copyFile(sourceUri, destinationPath);

    return destinationPath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

/**
 * Delete file
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file info
 */
export const getFileInfo = async (
  filePath: string,
): Promise<RNFS.StatResult | null> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      return await RNFS.stat(filePath);
    }
    return null;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

/**
 * Read file as base64
 */
export const readFileAsBase64 = async (filePath: string): Promise<string> => {
  try {
    return await RNFS.readFile(filePath, 'base64');
  } catch (error) {
    console.error('Error reading file as base64:', error);
    throw error;
  }
};

/**
 * Write base64 to file
 */
export const writeBase64ToFile = async (
  base64Data: string,
  filePath: string,
): Promise<void> => {
  try {
    // Ensure directory exists
    const directory = filePath.substring(0, filePath.lastIndexOf('/'));
    await ensureDirectoryExists(directory);

    await RNFS.writeFile(filePath, base64Data, 'base64');
  } catch (error) {
    console.error('Error writing base64 to file:', error);
    throw error;
  }
};

/**
 * Clean URI (remove file:// prefix if present)
 */
export const cleanUri = (uri: string): string => {
  return uri.replace('file://', '');
};

/**
 * Add file:// prefix if not present
 */
export const ensureFileProtocol = (uri: string): string => {
  return uri.startsWith('file://') ? uri : `file://${uri}`;
};

/**
 * Create media file object
 */
export const createMediaFile = (
  uri: string,
  fileName?: string,
  fileSize?: number,
  type?: string,
): MediaFile => {
  return {
    uri: cleanUri(uri),
    fileName: fileName || generateUniqueFilename(),
    fileSize,
    type: type || getMimeType(uri),
    timestamp: new Date(),
  };
};

/**
 * Validate media file
 */
export const validateMediaFile = (
  file: MediaFile,
  config: {
    maxSize?: number; // in bytes
    allowedTypes?: string[]; // array of extensions
  },
): {valid: boolean; error?: string} => {
  // Check file size
  if (config.maxSize && file.fileSize && file.fileSize > config.maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.fileSize)}) exceeds maximum allowed size (${formatFileSize(config.maxSize)})`,
    };
  }

  // Check file type
  if (config.allowedTypes && file.uri) {
    const extension = getFileExtension(file.uri);
    if (!config.allowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `File type .${extension} is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
      };
    }
  }

  return {valid: true};
};
