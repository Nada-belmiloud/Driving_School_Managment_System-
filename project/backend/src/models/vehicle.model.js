// backend/src/models/vehicle.model.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    licensePlate: {
        type: String,
        required: [true, 'License plate is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    // Assigned instructor (one vehicle can only be assigned to one instructor)
    assignedInstructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'retired'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for search
vehicleSchema.index({ licensePlate: 'text', model: 'text', brand: 'text' });
vehicleSchema.index({ status: 1 });

export default mongoose.model("Vehicle", vehicleSchema);

