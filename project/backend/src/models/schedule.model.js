// backend/src/models/schedule.model.js
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: [true, 'Candidate is required']
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: [true, 'Instructor is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true, 'Time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'cancelled', 'completed'],
            message: 'Status must be scheduled, cancelled, or completed'
        },
        default: 'scheduled'
    },
    // Type of lesson (phase)
    lessonType: {
        type: String,
        enum: ['highway_code', 'parking', 'driving'],
        required: [true, 'Lesson type is required']
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
scheduleSchema.index({ date: 1, time: 1 });
scheduleSchema.index({ candidateId: 1, date: 1 });
scheduleSchema.index({ instructorId: 1, date: 1 });
scheduleSchema.index({ status: 1 });

// Compound index for conflict checking
scheduleSchema.index({ instructorId: 1, date: 1, time: 1 });

export default mongoose.model("Schedule", scheduleSchema);

