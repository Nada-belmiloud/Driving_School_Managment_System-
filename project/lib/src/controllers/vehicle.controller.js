// backend/src/controllers/vehicle.controller.js
import Vehicle from "../models/vehicle.model.js";
import Lesson from "../models/lesson.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all vehicles with pagination and filtering
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Status filter
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search by plate number or model
    if (req.query.search) {
        query.$or = [
            { plateNumber: { $regex: req.query.search, $options: 'i' } },
            { model: { $regex: req.query.search, $options: 'i' } },
            { manufacturer: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Transmission filter
    if (req.query.transmission) {
        query.transmission = req.query.transmission;
    }

    // Fuel type filter
    if (req.query.fuelType) {
        query.fuelType = req.query.fuelType;
    }

    // Year range filter
    if (req.query.minYear) {
        query.year = { ...query.year, $gte: parseInt(req.query.minYear) };
    }
    if (req.query.maxYear) {
        query.year = { ...query.year, $lte: parseInt(req.query.maxYear) };
    }

    const vehicles = await Vehicle.find(query)
        .sort(req.query.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit);

    // Add usage statistics for each vehicle
    const vehiclesWithStats = await Promise.all(
        vehicles.map(async (vehicle) => {
            const totalLessons = await Lesson.countDocuments({ vehicleId: vehicle._id });
            const completedLessons = await Lesson.countDocuments({
                vehicleId: vehicle._id,
                status: 'completed'
            });
            const scheduledLessons = await Lesson.countDocuments({
                vehicleId: vehicle._id,
                status: 'scheduled',
                date: { $gte: new Date() }
            });

            return {
                ...vehicle.toJSON(),
                stats: {
                    totalLessons,
                    completedLessons,
                    scheduledLessons,
                    maintenanceDue: vehicle.maintenanceDue
                }
            };
        })
    );

    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
        success: true,
        count: vehiclesWithStats.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: vehiclesWithStats
    });
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicle = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Get usage statistics
    const totalLessons = await Lesson.countDocuments({ vehicleId: vehicle._id });
    const completedLessons = await Lesson.countDocuments({
        vehicleId: vehicle._id,
        status: 'completed'
    });
    const upcomingLessons = await Lesson.find({
        vehicleId: vehicle._id,
        status: 'scheduled',
        date: { $gte: new Date() }
    })
        .populate('studentId', 'name email')
        .populate('instructorId', 'name')
        .sort({ date: 1, time: 1 })
        .limit(10);

    const vehicleWithDetails = {
        ...vehicle.toJSON(),
        stats: {
            totalLessons,
            completedLessons,
            scheduledLessons: upcomingLessons.length
        },
        upcomingLessons
    };

    res.status(200).json({
        success: true,
        data: vehicleWithDetails
    });
});

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
export const addVehicle = asyncHandler(async (req, res, next) => {
    // Check if vehicle with plate number already exists
    const existingVehicle = await Vehicle.findOne({ plateNumber: req.body.plateNumber });

    if (existingVehicle) {
        return next(new AppError('Vehicle with this plate number already exists', 400));
    }

    // Check VIN if provided
    if (req.body.vin) {
        const existingVIN = await Vehicle.findOne({ vin: req.body.vin });
        if (existingVIN) {
            return next(new AppError('Vehicle with this VIN already exists', 400));
        }
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
        success: true,
        data: vehicle,
        message: 'Vehicle created successfully'
    });
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = asyncHandler(async (req, res, next) => {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check if plate number is being changed and if new plate already exists
    if (req.body.plateNumber && req.body.plateNumber !== vehicle.plateNumber) {
        const plateExists = await Vehicle.findOne({ plateNumber: req.body.plateNumber });
        if (plateExists) {
            return next(new AppError('Plate number already in use', 400));
        }
    }

    // Check VIN if being changed
    if (req.body.vin && req.body.vin !== vehicle.vin) {
        const vinExists = await Vehicle.findOne({ vin: req.body.vin });
        if (vinExists) {
            return next(new AppError('VIN already in use', 400));
        }
    }

    vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully'
    });
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check if vehicle has active lessons
    const activeLessons = await Lesson.countDocuments({
        vehicleId: req.params.id,
        status: 'scheduled'
    });

    if (activeLessons > 0) {
        return next(new AppError('Cannot delete vehicle with scheduled lessons', 400));
    }

    await vehicle.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Vehicle deleted successfully'
    });
});

