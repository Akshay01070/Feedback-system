const mongoose = require('mongoose');

const FeedbackResponseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackForm', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if anonymous, but good for tracking
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId }, // If we give questions IDs, otherwise rely on index/order or text
        questionText: { type: String },
        answer: { type: mongoose.Schema.Types.Mixed } // Number or String
    }],
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackResponse', FeedbackResponseSchema);
