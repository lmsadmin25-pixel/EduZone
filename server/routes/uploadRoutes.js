const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage, uploadVideo, uploadPdf } = require('../controllers/uploadController');

router.post('/image', protect, upload.single('file'), uploadImage);
router.post('/video', protect, upload.single('file'), uploadVideo);
router.post('/pdf', protect, upload.single('file'), uploadPdf);

module.exports = router;
