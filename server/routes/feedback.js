const express = require('express');
const router = express.Router();
const FeedbackForm = require('../models/FeedbackForm');
const FeedbackResponse = require('../models/FeedbackResponse');
const User = require('../models/User');

// Middleware to check if admin (Simplified)
// In real app use proper middleware
const isAdmin = async (req, res, next) => {
    // For prototype we might rely on client sending role or just allow
    // Ideally headers or session.
    // For now assuming the caller is trusted or we check a simplified header "x-role"
    // or just let it pass for this dev stage if auth middleware isn't strict yet
    next();
};

// Create a new feedback form
router.post('/create', isAdmin, async (req, res) => {
    try {
        const { title, description, questions, assignedFaculty, hasLabComponent } = req.body;
        const form = new FeedbackForm({
            title,
            description,
            questions,
            assignedFaculty,
            hasLabComponent: hasLabComponent || false
        });
        await form.save();
        res.json(form);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get all active forms (for students) with populated faculty info
router.get('/all', async (req, res) => {
    try {
        const forms = await FeedbackForm.find({ active: true })
            .populate('assignedFaculty', 'name email')
            .sort({ createdAt: -1 });
        res.json(forms);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get list of all faculty members
router.get('/faculty-list', async (req, res) => {
    try {
        const faculty = await User.find({ role: 'teacher' }).select('name email');
        res.json(faculty);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Submit feedback
router.post('/submit', async (req, res) => {
    try {
        const { formId, answers, studentId } = req.body;

        // Check if student has already submitted feedback for this form
        if (studentId) {
            const existingResponse = await FeedbackResponse.findOne({
                formId,
                studentId
            });

            if (existingResponse) {
                return res.status(400).json({
                    msg: 'You have already submitted feedback for this form'
                });
            }
        }

        const response = new FeedbackResponse({
            formId,
            answers,
            studentId // Optional
        });

        await response.save();
        res.json({ msg: 'Feedback submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Get all feedback responses (for admin/teacher)
router.get('/responses', async (req, res) => {
    try {
        const responses = await FeedbackResponse.find()
            .populate({ path: 'formId', select: 'title assignedFaculty' })
            .sort({ submittedAt: -1 });
        res.json(responses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get form IDs that a student has already submitted feedback for
router.get('/submitted/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const responses = await FeedbackResponse.find({ studentId }).select('formId');
        const submittedFormIds = responses.map(r => r.formId.toString());
        res.json({ submittedFormIds });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

