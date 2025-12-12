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
// newExamDate is the date when the new exam will be scheduled
examSchema.statics.canTakeExam = async function(candidateId, examType, newExamDate = null) {
    // Find the most recent completed exam (passed or failed) of this type for this candidate
    const lastExam = await this.findOne({
        candidateId,
        examType,
        status: { $in: ['passed', 'failed'] }
    }).sort({ date: -1, updatedAt: -1 });

    if (lastExam && lastExam.status === 'failed') {
        // Calculate the earliest allowed date (15 days after the last failed exam)
        const lastExamDate = new Date(lastExam.date);
        const earliestAllowed = new Date(lastExamDate);
        earliestAllowed.setDate(earliestAllowed.getDate() + 15);

        // If newExamDate is provided, check if it's at least 15 days after the last exam
        if (newExamDate) {
            const scheduledDate = new Date(newExamDate);
            scheduledDate.setHours(0, 0, 0, 0);
            earliestAllowed.setHours(0, 0, 0, 0);

            if (scheduledDate < earliestAllowed) {
                return {
                    canTake: false,
                    reason: `Must wait 15 days between exam attempts. Earliest available date: ${earliestAllowed.toISOString().split('T')[0]}`,
                    waitUntil: earliestAllowed
                };
            }
        } else {
            // If no newExamDate provided, check against today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (today < earliestAllowed) {
                return {
                    canTake: false,
                    reason: `Must wait 15 days between exam attempts. Earliest available date: ${earliestAllowed.toISOString().split('T')[0]}`,
                    waitUntil: earliestAllowed
                };
            }
        }
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

