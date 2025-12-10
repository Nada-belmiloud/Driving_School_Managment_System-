// backend/src/models/exam.model.js
import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
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
    // Exam type matches the candidate progress phases
    examType: {
        type: String,
        enum: {
            values: ['highway_code', 'parking', 'driving'],
            message: 'Exam type must be highway_code, parking, or driving'
        },
        required: [true, 'Exam type is required']
    },
    date: {
        type: Date,
        required: [true, 'Exam date is required']
    },
    time: {
        type: String,
        required: [true, 'Time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'passed', 'failed', 'cancelled'],
            message: 'Status must be scheduled, passed, failed, or cancelled'
        },
        default: 'scheduled'
    },
    // Track attempt number for this exam type
    attemptNumber: {
        type: Number,
        default: 1,
        min: 1
    },
    // Notes from the instructor about the exam result
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
examSchema.index({ candidateId: 1, examType: 1 });
examSchema.index({ instructorId: 1, date: 1 });
examSchema.index({ date: 1, time: 1 });
examSchema.index({ status: 1 });

// Static method to check if candidate can take exam (15-day waiting rule)
examSchema.statics.canTakeExam = async function(candidateId, examType) {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Find the most recent exam of this type for this candidate
    const recentExam = await this.findOne({
        candidateId,
        examType,
        date: { $gte: fifteenDaysAgo },
        status: { $in: ['passed', 'failed'] }
    }).sort({ date: -1 });

    if (recentExam) {
        const waitUntil = new Date(recentExam.date);
        waitUntil.setDate(waitUntil.getDate() + 15);
        return {
            canTake: false,
            reason: `Must wait 15 days between exam attempts. Next available date: ${waitUntil.toISOString().split('T')[0]}`,
            waitUntil
        };
    }

    return { canTake: true };
};

// Static method to get attempt number for new exam
examSchema.statics.getNextAttemptNumber = async function(candidateId, examType) {
    const count = await this.countDocuments({
        candidateId,
        examType,
        status: { $in: ['passed', 'failed'] }
    });
    return count + 1;
};

// Static method to check if candidate has passed a specific exam type
examSchema.statics.hasPassedExam = async function(candidateId, examType) {
    const passedExam = await this.findOne({
        candidateId,
        examType,
        status: 'passed'
    });
    return !!passedExam;
};

// Static method to get exam history for a candidate
examSchema.statics.getExamHistory = async function(candidateId) {
    return await this.find({ candidateId })
        .populate('instructorId', 'name')
        .sort({ date: -1 });
};

export default mongoose.model("Exam", examSchema);

