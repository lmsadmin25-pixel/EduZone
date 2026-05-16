const crypto = require('crypto');
const getRazorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { paymentSuccessTemplate } = require('../services/emailTemplates');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
const createOrder = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.isFree) {
      return res.status(400).json({ message: 'This is a free course. No payment needed.' });
    }

    const options = {
      amount: course.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await getRazorpay().orders.create(options);

    // Save payment record with pending status
    await Payment.create({
      student: req.user._id,
      course: courseId,
      amount: course.price,
      razorpayOrderId: order.id,
      status: 'pending'
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and enroll student
// @route   POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed'
      },
      { new: true }
    );

    // Enroll student in course
    await Enrollment.create({
      student: payment.student,
      course: payment.course
    });

    // Update course enrolled count
    const course = await Course.findById(payment.course);
    course.enrolledStudents += 1;
    await course.save();

    // Add to student's enrolled courses
    const student = await Student.findByIdAndUpdate(payment.student, {
      $addToSet: { enrolledCourses: payment.course }
    });

    // Send payment success email
    try {
      await sendEmail({
        to: student.email,
        subject: 'EduZone - Payment Successful',
        html: paymentSuccessTemplate(student.name, course.title, payment.amount)
      });
    } catch (emailErr) {
      console.error('Payment email failed:', emailErr.message);
    }

    // Create notification
    await Notification.create({
      user: payment.student,
      userType: 'Student',
      title: 'Payment Successful',
      message: `Payment of ₹${payment.amount} for "${course.title}" was successful.`,
      type: 'payment'
    });

    res.json({ message: 'Payment verified and enrolled successfully', payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history (Student)
// @route   GET /api/payments/history
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/reports
const getPaymentReports = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'completed' })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ payments, totalRevenue, totalTransactions: payments.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory, getPaymentReports };
