// backend/src/controllers/instructor.controller.js
import Instructor from "../models/instructor.model.js";
import Vehicle from "../models/vehicle.model.js";
import Schedule from "../models/schedule.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all instructors with pagination and filtering
// @route   GET /api/v1/instructors
// @access  Private
export const getInstructors = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status (exclude deleted by default)
    if (req.query.status) {
        query.status = req.query.status;
    } else {
        query.status = { $ne: 'deleted' };
    }

    // Search by name, email, or phone
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
            { phone: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const instructors = await Instructor.find(query)
        .populate('assignedVehicle', 'brand model licensePlate')
        .sort(req.query.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await Instructor.countDocuments(query);

    res.status(200).json({
        success: true,
        count: instructors.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: instructors
    });
});

// @desc    Get single instructor
// @route   GET /api/v1/instructors/:id
// @access  Private
export const getInstructor = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.id)
        .populate('assignedVehicle', 'brand model licensePlate');

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    res.status(200).json({
        success: true,
        data: instructor
    });
});

// @desc    Create instructor
// @route   POST /api/v1/instructors
// @access  Private
export const addInstructor = asyncHandler(async (req, res, next) => {
    const existingInstructor = await Instructor.findOne({ email: req.body.email });

    if (existingInstructor) {
        return next(new AppError('Instructor with this email already exists', 400));
    }

    const instructor = await Instructor.create(req.body);

    res.status(201).json({
        success: true,
        data: instructor,
        message: 'Instructor created successfully'
    });
});

// @desc    Update instructor
// @route   PUT /api/v1/instructors/:id
// @access  Private
export const updateInstructor = asyncHandler(async (req, res, next) => {
    let instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    // Check if email is being changed
    if (req.body.email && req.body.email !== instructor.email) {
        const emailExists = await Instructor.findOne({ email: req.body.email });
        if (emailExists) {
            return next(new AppError('Email already in use', 400));
        }
    }

    instructor = await Instructor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('assignedVehicle', 'brand model licensePlate');

    res.status(200).json({
        success: true,
        data: instructor,
        message: 'Instructor updated successfully'
    });
});

// @desc    Delete instructor (soft delete)
// @route   DELETE /api/v1/instructors/:id
// @access  Private
export const deleteInstructor = asyncHandler(async (req, res, next) => {
    const instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    // Check for scheduled lessons
    const scheduledLessons = await Schedule.countDocuments({
        instructorId: req.params.id,
        status: 'scheduled'
    });

    if (scheduledLessons > 0) {
        return next(new AppError('Cannot delete instructor with scheduled lessons', 400));
    }

    // Remove vehicle assignment if any
    if (instructor.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(instructor.assignedVehicle, {
            assignedInstructor: null
        });
    }

    // Soft delete
    instructor.status = 'deleted';
    instructor.assignedVehicle = null;
    await instructor.save();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Instructor deleted successfully'
    });
});

// @desc    Assign vehicle to instructor
// @route   PUT /api/v1/instructors/:id/assign-vehicle
// @access  Private
export const assignVehicle = asyncHandler(async (req, res, next) => {
    const { vehicleId } = req.body;

    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    if (instructor.status === 'deleted') {
        return next(new AppError('Cannot assign vehicle to deleted instructor', 400));
    }

    // If vehicleId is null, unassign current vehicle
    if (!vehicleId) {
        if (instructor.assignedVehicle) {
            await Vehicle.findByIdAndUpdate(instructor.assignedVehicle, {
                assignedInstructor: null
            });
        }
        instructor.assignedVehicle = null;
        await instructor.save();

        return res.status(200).json({
            success: true,
            data: instructor,
            message: 'Vehicle unassigned successfully'
        });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    if (vehicle.status === 'retired') {
        return next(new AppError('Cannot assign retired vehicle', 400));
    }

    // Check if vehicle is already assigned to another instructor
    if (vehicle.assignedInstructor &&
        vehicle.assignedInstructor.toString() !== instructor._id.toString()) {
        return next(new AppError('Vehicle is already assigned to another instructor', 400));
    }

    // Unassign old vehicle if instructor had one
    if (instructor.assignedVehicle &&
        instructor.assignedVehicle.toString() !== vehicleId) {
        await Vehicle.findByIdAndUpdate(instructor.assignedVehicle, {
            assignedInstructor: null
        });
    }

    // Assign new vehicle
    instructor.assignedVehicle = vehicleId;
    await instructor.save();

    // Update vehicle with instructor
    vehicle.assignedInstructor = instructor._id;
    await vehicle.save();

    await instructor.populate('assignedVehicle', 'brand model licensePlate');

    res.status(200).json({
        success: true,
        data: instructor,
        message: 'Vehicle assigned successfully'
    });
});

// @desc    Get total number of instructors
// @route   GET /api/v1/instructors/count
// @access  Private
export const getInstructorCount = asyncHandler(async (req, res, next) => {
    const total = await Instructor.countDocuments({ status: { $ne: 'deleted' } });

    res.status(200).json({
        success: true,
        data: {
            total
        }
    });
});

