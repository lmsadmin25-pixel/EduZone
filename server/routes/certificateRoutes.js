const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  generateCertificate, getMyCertificates, getCertificateById
} = require('../controllers/certificateController');

router.post('/generate', protect, roleAuth('student'), generateCertificate);
router.get('/my', protect, roleAuth('student'), getMyCertificates);
router.get('/:id', getCertificateById);

module.exports = router;
