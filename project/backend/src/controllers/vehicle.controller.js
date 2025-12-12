// backend/src/controllers/vehicle.controller.js
import Vehicle from "../models/vehicle.model.js";
import Instructor from "../models/instructor.model.js";
import MaintenanceLog from "../models/maintenanceLog.model.js";
import { asyncHandler, AppError } from "../middleware/error.middleware.js";

// @desc    Get all vehicles with pagination and filtering
// @route   GET /api/v1/vehicles
// @access  Private
export const getVehicles = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Search by license plate, model, or brand
    if (req.query.search) {
        query.$or = [
            { licensePlate: { $regex: req.query.search, $options: 'i' } },
            { model: { $regex: req.query.search, $options: 'i' } },
            { brand: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    const vehicles = await Vehicle.find(query)
        .populate('assignedInstructor', 'name email phone')
        .sort(req.query.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit);

    // Fetch maintenance logs for each vehicle
    const vehiclesWithLogs = await Promise.all(
        vehicles.map(async (vehicle) => {
            const logs = await MaintenanceLog.find({ vehicleId: vehicle._id }).sort('-date');
            const vehicleObj = vehicle.toObject();
            return {
                ...vehicleObj,
                maintenanceLogs: logs
            };
        })
    );

    const total = await Vehicle.countDocuments(query);

    res.status(200).json({
        success: true,
        count: vehicles.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        data: vehiclesWithLogs
    });
});

// @desc    Get single vehicle
// @route   GET /api/v1/vehicles/:id
// @access  Private
export const getVehicle = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id)
        .populate('assignedInstructor', 'name email phone');

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    res.status(200).json({
        success: true,
        data: vehicle
    });
});

// @desc    Create new vehicle
// @route   POST /api/v1/vehicles
// @access  Private
export const addVehicle = asyncHandler(async (req, res, next) => {
    // Check if vehicle with license plate already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate: req.body.licensePlate });

    if (existingVehicle) {
        return next(new AppError('Vehicle with this license plate already exists', 400));
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
        success: true,
        data: vehicle,
        message: 'Vehicle created successfully'
    });
});

// @desc    Update vehicle
// @route   PUT /api/v1/vehicles/:id
// @access  Private
export const updateVehicle = asyncHandler(async (req, res, next) => {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Check if license plate is being changed
    if (req.body.licensePlate && req.body.licensePlate !== vehicle.licensePlate) {
        const plateExists = await Vehicle.findOne({ licensePlate: req.body.licensePlate });
        if (plateExists) {
            return next(new AppError('License plate already in use', 400));
        }
    }

    vehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    ).populate('assignedInstructor', 'name email phone');

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully'
    });
});

// @desc    Delete vehicle
// @route   DELETE /api/v1/vehicles/:id
// @access  Private
export const deleteVehicle = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    // Unassign from instructor if assigned
    if (vehicle.assignedInstructor) {
        await Instructor.findByIdAndUpdate(vehicle.assignedInstructor, {
            assignedVehicle: null
        });
    }

    // Delete all maintenance logs for this vehicle
    await MaintenanceLog.deleteMany({ vehicleId: vehicle._id });

    // Delete the vehicle
    await vehicle.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
        message: 'Vehicle deleted successfully'
    });
});

// @desc    Assign instructor to vehicle
// @route   PUT /api/v1/vehicles/:id/assign-instructor
// @access  Private
export const assignInstructor = asyncHandler(async (req, res, next) => {
    const { instructorId } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    if (vehicle.status === 'retired') {
        return next(new AppError('Cannot assign instructor to retired vehicle', 400));
    }

    // If instructorId is null, unassign current instructor
    if (!instructorId) {
        if (vehicle.assignedInstructor) {
            await Instructor.findByIdAndUpdate(vehicle.assignedInstructor, {
                assignedVehicle: null
            });
        }
        vehicle.assignedInstructor = null;
        await vehicle.save();

        return res.status(200).json({
            success: true,
            data: vehicle,
            message: 'Instructor unassigned successfully'
        });
    }

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
        return next(new AppError('Instructor not found', 404));
    }

    if (instructor.status === 'deleted') {
        return next(new AppError('Cannot assign deleted instructor', 400));
    }

    // Check if instructor already has a vehicle assigned
    if (instructor.assignedVehicle &&
        instructor.assignedVehicle.toString() !== vehicle._id.toString()) {
        return next(new AppError('Instructor already has a vehicle assigned', 400));
    }

    // Unassign old instructor if vehicle had one
    if (vehicle.assignedInstructor &&
        vehicle.assignedInstructor.toString() !== instructorId) {
        await Instructor.findByIdAndUpdate(vehicle.assignedInstructor, {
            assignedVehicle: null
        });
    }

    // Assign new instructor
    vehicle.assignedInstructor = instructorId;
    await vehicle.save();

    // Update instructor with vehicle
    instructor.assignedVehicle = vehicle._id;
    await instructor.save();

    await vehicle.populate('assignedInstructor', 'name email phone');

    res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Instructor assigned successfully'
    });
});

// @desc    Get total number of vehicles
// @route   GET /api/v1/vehicles/count
// @access  Private
export const getVehicleCount = asyncHandler(async (req, res, next) => {
    const total = await Vehicle.countDocuments({ status: { $ne: 'retired' } });

    res.status(200).json({
        success: true,
        data: {
            total
        }
    });
});

// ==================== MAINTENANCE LOGS ====================

// @desc    Get maintenance logs for a vehicle
// @route   GET /api/v1/vehicles/:id/maintenance-logs
// @access  Private
export const getMaintenanceLogs = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await MaintenanceLog.find({ vehicleId: req.params.id })
        .sort('-date')
        .skip(skip)
        .limit(limit);

    const total = await MaintenanceLog.countDocuments({ vehicleId: req.params.id });

    // Calculate total cost
    const allLogs = await MaintenanceLog.find({ vehicleId: req.params.id });
    const totalCost = allLogs.reduce((sum, log) => sum + log.cost, 0);

    res.status(200).json({
        success: true,
        count: logs.length,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        totalCost,
        data: logs
    });
});

// @desc    Add maintenance log
// @route   POST /api/v1/vehicles/:id/maintenance-logs
// @access  Private
export const addMaintenanceLog = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    const logData = {
        vehicleId: req.params.id,
        ...req.body
    };

    const maintenanceLog = await MaintenanceLog.create(logData);

    res.status(201).json({
        success: true,
        data: maintenanceLog,
        message: 'Maintenance log added successfully'
    });
});

// @desc    Update maintenance log
// @route   PUT /api/v1/vehicles/:id/maintenance-logs/:logId
// @access  Private
export const updateMaintenanceLog = asyncHandler(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
        return next(new AppError('Vehicle not found', 404));
    }

    let log = await MaintenanceLog.findOne({
        _id: req.params.logId,
        vehicleId: req.params.id
    });

    if (!log) {
        return next(new AppError('Maintenance log not found', 404));
    }

    log = await MaintenanceLog.findByIdAndUpdate(
        req.params.logId,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: log,
        message: 'Maintenance log updated successfully'
    });
});

