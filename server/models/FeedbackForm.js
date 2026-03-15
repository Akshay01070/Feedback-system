const mongoose = require('mongoose');

const FeedbackFormSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['score', 'text', 'choice'], required: true },
        section: { type: String }, // Grouping: "Organization", "Presentation", "General"
        options: [{ type: String }], // For choice type
        required: { type: Boolean, default: true }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The professor being evaluated
    hasLabComponent: { type: Boolean, default: false }, // Does this subject have a lab?
    startDate: { type: Date }, // Optional: when the form opens
    endDate: { type: Date }, // Optional: when the form closes
    allowedEmails: [{ type: String }], // Optional: list of specific student emails who can access this. If empty, all students can access.
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FeedbackForm', FeedbackFormSchema);
