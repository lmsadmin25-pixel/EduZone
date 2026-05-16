const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Get all published courses (with search, filter, pagination)
// @route   GET /api/courses
const getCourses = async (req, res, next) => {
  try {
    const { search, category, level, sort, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (level) query.level = level;

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popular') sortOption = { enrolledStudents: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate('educator', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      courses,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course details
// @route   GET /api/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('educator', 'name avatar bio expertise');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Create course (Educator)
// @route   POST /api/courses
const createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      educator: req.user._id,
      isFree: req.body.price === 0 || !req.body.price
    };

    const course = await Course.create(courseData);

    // Add course to educator's courses array
    req.user.courses.push(course._id);
    await req.user.save();

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course (Educator, owner only)
// @route   PUT /api/courses/:id
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.educator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    if (req.body.price !== undefined) {
      req.body.isFree = req.body.price === 0;
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Course updated', course: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (Educator/Admin)
// @route   DELETE /api/courses/:id
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.userRole === 'educator' && course.educator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
const addLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.educator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lesson = {
      title: req.body.title,
      videoUrl: req.body.videoUrl || '',
      pdfUrl: req.body.pdfUrl || '',
      duration: req.body.duration || '',
      order: course.lessons.length + 1
    };

    course.lessons.push(lesson);
    await course.save();

    res.status(201).json({ message: 'Lesson added', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/courses/:id/lessons/:lessonId
const updateLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    Object.assign(lesson, req.body);
    await course.save();

    res.json({ message: 'Lesson updated', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/courses/:id/lessons/:lessonId
const deleteLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.lessons = course.lessons.filter(l => l._id.toString() !== req.params.lessonId);
    await course.save();

    res.json({ message: 'Lesson deleted', course });
  } catch (error) {
    next(error);
  }
};

// @desc    Get educator's own courses
// @route   GET /api/courses/my-courses
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ educator: req.user._id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, addLesson, updateLesson, deleteLesson, getMyCourses
};
