const cloudinary = require('../config/cloudinary');

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// @desc    Upload image (thumbnail, avatar)
// @route   POST /api/upload/image
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'eduzone/images',
      resource_type: 'image',
      transformation: [{ width: 800, height: 450, crop: 'fill' }]
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload video
// @route   POST /api/upload/video
const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'eduzone/videos',
      resource_type: 'video'
    });

    res.json({ url: result.secure_url, publicId: result.public_id, duration: result.duration });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload PDF / document
// @route   POST /api/upload/pdf
const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'eduzone/pdfs',
      resource_type: 'raw'
    });

    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, uploadVideo, uploadPdf };
