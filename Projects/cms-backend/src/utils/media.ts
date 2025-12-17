import fs from 'fs';
import path from 'path';
import sharp, { ResizeOptions } from 'sharp';

export interface ImageSizes {
  thumb?: string;
  medium?: string;
  large?: string;
  original?: string;
}

export interface ProcessedImage {
  original: string;
  thumb: string;
  medium: string;
  large: string;
  width: number;
  height: number;
  sizes: ImageSizes;
}

/**
 * Ensure upload directory exists
 */
export function ensureUploadDir(uploadPath: string): void {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
}

/**
 * Process uploaded image: create thumbnails and resize versions
 */
const TARGET_FILE_SIZE_BYTES = 100 * 1024; // 100KB
const QUALITY_STEPS = [85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15];

interface VariantOptions {
  resize?: ResizeOptions;
  allowScaleDown?: boolean;
  minScale?: number;
  scaleStep?: number;
  targetBytes?: number;
  logLabel?: string;
}

interface VariantResult {
  width: number;
  height: number;
  bytes: number;
  quality: number;
}

async function saveVariantUnderTarget(
  filePath: string,
  outputPath: string,
  options: VariantOptions
): Promise<VariantResult> {
  const targetBytes = options.targetBytes ?? TARGET_FILE_SIZE_BYTES;
  const allowScaleDown = options.allowScaleDown ?? true;
  const minScale = allowScaleDown ? options.minScale ?? 0.4 : 1;
  const scaleStep = options.scaleStep ?? 0.85;
  const label = options.logLabel || 'variant';

  let currentScale = 1;
  let lastResult: { data: Buffer; info: sharp.OutputInfo; quality: number; scale: number } | null = null;

  while (currentScale >= minScale) {
    for (const quality of QUALITY_STEPS) {
      let pipeline = sharp(filePath);
      if (options.resize) {
        const resizeOptions: ResizeOptions = { ...options.resize };
        if (allowScaleDown && (resizeOptions.width || resizeOptions.height)) {
          if (resizeOptions.width) {
            resizeOptions.width = Math.max(1, Math.floor(resizeOptions.width * currentScale));
          }
          if (resizeOptions.height) {
            resizeOptions.height = Math.max(1, Math.floor(resizeOptions.height * currentScale));
          }
        }
        pipeline = pipeline.resize(resizeOptions);
      }

      const result = await pipeline
        .webp({ quality, effort: 6 })
        .toBuffer({ resolveWithObject: true });

      lastResult = { data: result.data, info: result.info, quality, scale: currentScale };

      if (result.data.length <= targetBytes) {
        await fs.promises.writeFile(outputPath, result.data);
        console.log(
          `[processImage] ${label} saved ${(result.data.length / 1024).toFixed(1)}KB @q${quality} scale ${currentScale.toFixed(
            2
          )}`
        );
        return {
          width: result.info.width,
          height: result.info.height,
          bytes: result.data.length,
          quality,
        };
      }
    }

    if (!allowScaleDown) {
      break;
    }

    currentScale *= scaleStep;
  }

  if (lastResult) {
    await fs.promises.writeFile(outputPath, lastResult.data);
    console.warn(
      `[processImage] ${label} fallback ${(lastResult.data.length / 1024).toFixed(1)}KB @q${
        lastResult.quality
      } scale ${lastResult.scale.toFixed(2)}`
    );
    return {
      width: lastResult.info.width,
      height: lastResult.info.height,
      bytes: lastResult.data.length,
      quality: lastResult.quality,
    };
  }

  throw new Error(`Failed to generate ${label} variant`);
}

export async function processImage(
  filePath: string,
  outputDir: string,
  fileName: string
): Promise<ProcessedImage> {
  console.log('[processImage] Starting process:', { filePath, outputDir, fileName });
  
  try {
    ensureUploadDir(outputDir);
    console.log('[processImage] Output directory ensured');

    const fileExt = path.extname(fileName);
    const baseName = path.basename(fileName, fileExt);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Input file does not exist: ${filePath}`);
    }

    console.log('[processImage] Reading image metadata...');
    let metadata;
    try {
      metadata = await sharp(filePath).metadata();
      console.log('[processImage] Image metadata:', { width: metadata.width, height: metadata.height, format: metadata.format });
    } catch (sharpError: any) {
      console.error('[processImage] Error reading metadata:', sharpError);
      throw new Error(`Invalid image file or corrupted: ${sharpError.message || 'Unknown error'}`);
    }
    
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const sizes: ImageSizes = {};

    console.log('[processImage] Creating thumbnail (<=100KB)...');
    const thumbPath = path.join(outputDir, `${baseName}_thumb.webp`);
    try {
      await saveVariantUnderTarget(filePath, thumbPath, {
        resize: { width: 150, height: 150, fit: 'cover', position: 'center' },
        allowScaleDown: false,
        logLabel: 'thumbnail',
      });
      sizes.thumb = path.basename(thumbPath);
    } catch (thumbError: any) {
      console.error('[processImage] Error creating thumbnail:', thumbError);
      throw new Error(`Failed to create thumbnail: ${thumbError.message}`);
    }

    console.log('[processImage] Creating medium size (<=100KB)...');
    const mediumPath = path.join(outputDir, `${baseName}_medium.webp`);
    try {
      await saveVariantUnderTarget(filePath, mediumPath, {
        resize: { width: 800, height: 800, fit: 'inside', withoutEnlargement: true },
        allowScaleDown: true,
        minScale: 0.4,
        logLabel: 'medium',
      });
      sizes.medium = path.basename(mediumPath);
    } catch (mediumError: any) {
      console.error('[processImage] Error creating medium size:', mediumError);
      throw new Error(`Failed to create medium size: ${mediumError.message}`);
    }

    console.log('[processImage] Creating large size (<=100KB)...');
    const largePath = path.join(outputDir, `${baseName}_large.webp`);
    try {
      await saveVariantUnderTarget(filePath, largePath, {
        resize: { width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true },
        allowScaleDown: true,
        minScale: 0.4,
        logLabel: 'large',
      });
      sizes.large = path.basename(largePath);
    } catch (largeError: any) {
      console.error('[processImage] Error creating large size:', largeError);
      throw new Error(`Failed to create large size: ${largeError.message}`);
    }

    console.log('[processImage] Creating original size (<=100KB)...');
    const originalPath = path.join(outputDir, `original_${baseName}.webp`);
    const originalMaxDimension = 2048;
    const originalResult = await saveVariantUnderTarget(filePath, originalPath, {
      resize: {
        width: Math.min(width || originalMaxDimension, originalMaxDimension),
        height: Math.min(height || originalMaxDimension, originalMaxDimension),
        fit: 'inside',
        withoutEnlargement: true,
      },
      allowScaleDown: true,
      minScale: 0.3,
      logLabel: 'original',
    }).catch((originalError) => {
      console.error('[processImage] Error creating original WebP:', originalError);
      throw new Error(`Failed to create original WebP: ${(originalError as Error).message}`);
    });

    sizes.original = path.basename(originalPath);

    console.log('[processImage] All sizes processed successfully');
    return {
      original: sizes.original,
      thumb: sizes.thumb,
      medium: sizes.medium,
      large: sizes.large,
      width: originalResult.width,
      height: originalResult.height,
      sizes,
    };
  } catch (error: any) {
    console.error('[processImage] Unexpected error:', error);
    throw error;
  }
}

/**
 * Delete image and all its versions
 */
export function deleteImageFiles(uploadDir: string, sizes: ImageSizes): void {
  // Validate inputs
  if (!uploadDir || typeof uploadDir !== 'string') {
    console.error('[deleteImageFiles] Invalid uploadDir:', uploadDir);
    return;
  }

  if (!sizes || typeof sizes !== 'object') {
    console.error('[deleteImageFiles] Invalid sizes:', sizes);
    return;
  }

  const filesToDelete = [
    sizes.thumb,
    sizes.medium,
    sizes.large,
    sizes.original,
  ].filter(Boolean);

  filesToDelete.forEach((file) => {
    if (typeof file !== 'string') {
      console.error('[deleteImageFiles] Invalid file name:', file);
      return;
    }
    
    const filePath = path.join(uploadDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('[deleteImageFiles] Deleted:', filePath);
    }
  });

  // Try to delete the directory if it's empty
  try {
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      if (files.length === 0) {
        fs.rmdirSync(uploadDir);
        console.log('[deleteImageFiles] Deleted empty directory:', uploadDir);
      }
    }
  } catch (err) {
    // Ignore errors when deleting directory
  }
}

/**
 * Get file size in bytes
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert image to WebP and try to keep it under 100KB
 * Used by assetController for legacy compatibility
 */
export async function toWebpUnder100KB(
  input: Buffer,
  maxWidth: number
): Promise<{ buffer: Buffer; info: { width: number; height: number } }> {
  let quality = 85;
  let buffer: Buffer;
  let info: sharp.OutputInfo;

  // Start with default quality and reduce if needed
  while (quality >= 40) {
    const result = await sharp(input)
      .resize(maxWidth, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });

    buffer = result.data;
    info = result.info;

    // If under 100KB or quality is already low, return
    if (buffer.byteLength <= 100 * 1024 || quality <= 40) {
      return {
        buffer,
        info: {
          width: info.width,
          height: info.height,
        },
      };
    }

    // Reduce quality and try again
    quality -= 10;
  }

  // Fallback (should not reach here)
  const result = await sharp(input)
    .resize(maxWidth, undefined, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    info: {
      width: result.info.width,
      height: result.info.height,
    },
  };
}
