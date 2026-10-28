import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

export default function uploadToCloudinary(buffer, folder, resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your-api-key') {
      const mime = resourceType === 'raw' ? 'application/pdf' : 'image/png';
      const base64 = buffer.toString('base64');
      return resolve({
        secure_url: `data:${mime};base64,${base64}`,
        public_id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload error, falling back to data URL:', error.message);
          const mime = resourceType === 'raw' ? 'application/pdf' : 'image/png';
          return resolve({
            secure_url: `data:${mime};base64,${buffer.toString('base64')}`,
            public_id: `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          });
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export function deleteFromCloudinary(publicId, resourceType = 'image') {
  return new Promise((resolve) => {
    if (!publicId || publicId.startsWith('mock_') || publicId.startsWith('fallback_')) {
      return resolve({ result: 'ok' });
    }
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your-api-key') {
      return resolve({ result: 'ok' });
    }
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (err, res) => {
      if (err) console.warn('Cloudinary delete warning:', err.message);
      resolve(res || { result: 'ok' });
    });
  });
}

