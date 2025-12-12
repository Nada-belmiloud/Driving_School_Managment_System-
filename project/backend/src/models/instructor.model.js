// backend/src/models/instructor.model.js
import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    // One instructor can have only one assigned vehicle
    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for search
instructorSchema.index({ name: 'text', email: 'text' });
instructorSchema.index({ status: 1 });

export default mongoose.model("Instructor", instructorSchema);

