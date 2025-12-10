// backend/src/controllers/payment.controller.js
import Payment from "../models/payment.model.js";
import Candidate from "../models/candidate.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all payments with pagination and filtering
// @route   GET /api/v1/payments
// @access  Private
export const getPayments = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by candidate
    if (req.query.candidateId) {
        query.candidateId = req.query.candidateId;
    }

    const payments = await Payment.find(query)
        .populate('candidateId', 'name email phone')
        .sort('-date')
        .skip(skip)
        .limit(limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
        success: true,
        count: payments.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: payments
    });
});

// @desc    Get single payment
// @route   GET /api/v1/payments/:id
// @access  Private
export const getPayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id)
        .populate('candidateId', 'name email phone');

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    res.status(200).json({
        success: true,
        data: payment
    });
});

// @desc    Create payment
// @route   POST /api/v1/payments
// @access  Private
export const addPayment = asyncHandler(async (req, res, next) => {
    const { candidateId, amount, status } = req.body;

    // Validate candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    const payment = await Payment.create({
        candidateId,
        amount,
        status: status || 'pending',
        date: req.body.date || new Date()
    });

    await payment.populate('candidateId', 'name email phone');

    res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully'
    });
});

// @desc    Update payment
// @route   PUT /api/v1/payments/:id
// @access  Private
export const updatePayment = asyncHandler(async (req, res, next) => {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    payment = await Payment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('candidateId', 'name email phone');

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment updated successfully'
    });
});

// @desc    Delete payment
// @route   DELETE /api/v1/payments/:id
// @access  Private
export const deletePayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    await payment.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Payment deleted successfully'
    });
});

// @desc    Mark payment as paid
// @route   PUT /api/v1/payments/:id/mark-paid
// @access  Private
export const markAsPaid = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new AppError('Payment not found', 404));
    }

    payment.status = 'paid';
    payment.date = new Date(); // Update to current date when marked as paid
    await payment.save();

    await payment.populate('candidateId', 'name email phone');

    res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment marked as paid'
    });
});

// @desc    Get pending payments
// @route   GET /api/v1/payments/pending
// @access  Private
export const getPendingPayments = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find({ status: 'pending' })
        .populate('candidateId', 'name email phone')
        .sort('-date');

    const totalPendingAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
        success: true,
        count: payments.length,
        totalPendingAmount,
        data: payments
    });
});

// @desc    Get pending payments count (for dashboard)
// @route   GET /api/v1/payments/pending/count
// @access  Private
export const getPendingPaymentsCount = asyncHandler(async (req, res, next) => {
    const count = await Payment.countDocuments({ status: 'pending' });

    const pendingPayments = await Payment.find({ status: 'pending' });
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
        success: true,
        data: {
            count,
            totalPendingAmount
        }
    });
});

// @desc    Get candidate payments
// @route   GET /api/v1/payments/candidate/:candidateId
// @access  Private
export const getCandidatePayments = asyncHandler(async (req, res, next) => {
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    const payments = await Payment.find({ candidateId: req.params.candidateId })
        .sort('-date');

    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
        success: true,
        count: payments.length,
        data: {
            payments,
            summary: {
                totalPaid,
                totalPending,
                paymentCount: payments.length
            }
        }
    });
});

