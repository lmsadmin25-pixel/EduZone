const Review = require('../models/Review');
const Course = require('../models/Course');

// @desc    Add review
// @route   POST /api/reviews
const addReview = async (req, res, next) => {
  try {
    const { courseId, rating, comment } = req.body;

    const existing = await Review.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this course' });

    const review = await Review.create({
      student: req.user._id,
      course: courseId,
      rating,
      comment
    });

    // Update course average rating
    const reviews = await Review.find({ course: courseId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a course
// @route   GET /api/reviews/course/:courseId
const getReviewsByCourse = async (req, res, next) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview, getReviewsByCourse };
