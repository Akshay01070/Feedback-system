const mongoose = require('mongoose');

const FeedbackResponseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackForm', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId },
        questionText: { type: String },
        answer: { type: mongoose.Schema.Types.Mixed },
        section: { type: String }
    }],
    approvedForTeacher: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackResponse', FeedbackResponseSchema);
