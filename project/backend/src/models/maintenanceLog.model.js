// backend/src/models/maintenanceLog.model.js
import mongoose from "mongoose";

const maintenanceLogSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: [true, 'Vehicle is required']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        enum: ['oil-change', 'tire-replacement', 'brake-service', 'inspection', 'repair', 'other'],
        required: [true, 'Maintenance type is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    cost: {
        type: Number,
        required: [true, 'Cost is required'],
        min: [0, 'Cost cannot be negative']
    },
    performedBy: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
maintenanceLogSchema.index({ vehicleId: 1, date: -1 });
maintenanceLogSchema.index({ type: 1 });

export default mongoose.model("MaintenanceLog", maintenanceLogSchema);

