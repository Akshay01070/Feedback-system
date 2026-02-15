const mongoose = require('mongoose');

const FeedbackFormSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['score', 'text', 'choice'], required: true },
        options: [{ type: String }], // For choice type
        required: { type: Boolean, default: true }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackForm', FeedbackFormSchema);
