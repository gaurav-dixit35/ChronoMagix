import cloudinary from '../../config/cloudinary.js';

export async function save(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'chronomagix/courses' }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });
}
