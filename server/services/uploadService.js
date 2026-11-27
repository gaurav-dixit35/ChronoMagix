import { env } from '../config/env.js';
import * as cloudinaryStorage from './storage/cloudinaryStorage.js';
import * as dataUrlStorage from './storage/dataUrlStorage.js';

/** Store an in-memory image remotely when configured, otherwise as a bounded data URL. */
export async function saveImage(file) {
  if (!file) return undefined;
  const storage = env.CLOUDINARY_URL ? cloudinaryStorage : dataUrlStorage;
  return storage.save(file);
}
