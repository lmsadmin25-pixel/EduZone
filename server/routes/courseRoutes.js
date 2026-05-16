const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  getCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, addLesson, updateLesson, deleteLesson, getMyCourses
} = require('../controllers/courseController');

// Public
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Educator only
router.get('/educator/my-courses', protect, roleAuth('educator'), getMyCourses);
router.post('/', protect, roleAuth('educator'), createCourse);
router.put('/:id', protect, roleAuth('educator'), updateCourse);
router.delete('/:id', protect, roleAuth('educator', 'admin'), deleteCourse);

// Lessons
router.post('/:id/lessons', protect, roleAuth('educator'), addLesson);
router.put('/:id/lessons/:lessonId', protect, roleAuth('educator'), updateLesson);
router.delete('/:id/lessons/:lessonId', protect, roleAuth('educator'), deleteLesson);

module.exports = router;
