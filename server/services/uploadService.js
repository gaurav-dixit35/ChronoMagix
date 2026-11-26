import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

/** Store an in-memory image remotely when configured, otherwise as a bounded data URL. */
export async function saveImage(file) {
  if (!file) return undefined;
  if (!env.CLOUDINARY_URL) return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  cloudinary.config({ secure: true });
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'chronomagix/courses' }, (error, value) => error ? reject(error) : resolve(value));
    stream.end(file.buffer);
  });
  return result.secure_url;
}
