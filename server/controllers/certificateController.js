const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Generate certificate on course completion
// @route   POST /api/certificates/generate
const generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (enrollment.progress < 100) {
      return res.status(400).json({ message: 'Complete all lessons to get certificate' });
    }

    // Check if certificate already issued
    const existing = await Certificate.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.json({ message: 'Certificate already issued', certificate: existing });

    const certificate = await Certificate.create({
      student: req.user._id,
      course: courseId
    });

    // Update enrollment
    enrollment.certificateIssued = true;
    await enrollment.save();

    // Add to student's certificates
    await Student.findByIdAndUpdate(req.user._id, {
      $addToSet: { certificates: certificate._id }
    });

    res.status(201).json({ message: 'Certificate generated', certificate });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's certificates
// @route   GET /api/certificates/my
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title category thumbnail',
        populate: { path: 'educator', select: 'name' }
      })
      .sort({ issuedAt: -1 });
    res.json(certificates);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate({
        path: 'course',
        select: 'title category',
        populate: { path: 'educator', select: 'name' }
      });

    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
    res.json(certificate);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateCertificate, getMyCertificates, getCertificateById };
