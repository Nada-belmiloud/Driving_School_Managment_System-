// backend/src/models/candidate.model.js
import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
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
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(value) {
                if (!value) return true;
                const age = Math.floor((new Date() - value) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 16 && age <= 100;
            },
            message: 'Candidate must be between 16 and 100 years old'
        }
    },
    licenseType: {
        type: String,
        required: [true, 'License type is required'],
        enum: {
            values: ['A1', 'A2', 'B', 'C1', 'C2', 'D'],
            message: 'License type must be A1, A2, B, C1, C2, or D'
        }
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'completed', 'deleted'],
            message: 'Status must be active, completed, or deleted'
        },
        default: 'active'
    },
    progress: {
        type: String,
        enum: {
            values: ['highway_code', 'parking', 'driving'],
            message: 'Progress must be highway_code, parking, or driving'
        },
        default: 'highway_code'
    },
    totalFee: {
        type: Number,
        default: 34000
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    payments: [{
        id: String,
        amount: Number,
        date: String,
        note: String
    }]
}, {
    timestamps: true
});

// Indexes for search and filtering
candidateSchema.index({ name: 'text', email: 'text', phone: 'text' });
candidateSchema.index({ licenseType: 1, status: 1 });
candidateSchema.index({ progress: 1 });

export default mongoose.model("Candidate", candidateSchema);

