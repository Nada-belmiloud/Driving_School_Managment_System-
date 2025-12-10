// backend/src/models/payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: [true, 'Candidate is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'paid'],
            message: 'Status must be pending or paid'
        },
        default: 'pending'
    },
    // Single date field - when payment was recorded/made
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ candidateId: 1, date: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ date: -1 });

export default mongoose.model("Payment", paymentSchema);

