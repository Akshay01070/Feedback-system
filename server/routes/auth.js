const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    console.log('=== REGISTER START ===');
    console.log('Body:', JSON.stringify(req.body));
    try {
        const { email, password, role, name } = req.body;
        console.log('[REG 1] Parsed:', { email, role, name: name || '(empty)' });

        // Check if user exists
        let user = await User.findOne({ email });
        console.log('[REG 2] User lookup done, exists:', !!user);
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log('[REG 3] Password hashed');

        // Determine Name if not provided
        const userRole = role || 'student';
        let finalName = name;
        if (!finalName) {
            if (userRole === 'admin') finalName = 'Admin';
            else if (userRole === 'student') finalName = 'Student';
            else return res.status(400).json({ msg: 'Name is required for Teachers' });
        }
        console.log('[REG 4] finalName:', finalName, 'userRole:', userRole);

        user = new User({
            name: finalName,
            email,
            passwordHash,
            role: userRole
        });
        console.log('[REG 5] User object created');

        await user.save();
        console.log('[REG 6] User saved to DB');

        // Create token
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error('[REG 7] JWT error:', err);
                return res.status(500).json({ msg: 'JWT error', error: err.message });
            }
            console.log('[REG 8] Token generated. SUCCESS.');
            res.json({ token });
        });
    } catch (err) {
        console.error('=== REGISTER ERROR ===');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('=== LOGIN START ===');
    console.log('Body:', JSON.stringify(req.body));
    try {
        const { email, password } = req.body;
        console.log('[LOGIN 1] Email:', email);

        // Check user
        const user = await User.findOne({ email });
        console.log('[LOGIN 2] User found:', !!user);
        if (!user) {
            console.log('[LOGIN 2b] User NOT found, returning 400');
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        console.log('[LOGIN 3] User details:', { id: user._id, email: user.email, role: user.role, name: user.name });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log('[LOGIN 4] Password match:', isMatch);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return token
        const payload = { user: { id: user.id, role: user.role } };
        console.log('[LOGIN 5] Signing JWT...');
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error('[LOGIN 6] JWT error:', err);
                return res.status(500).json({ msg: 'JWT error', error: err.message });
            }
            console.log('[LOGIN 7] SUCCESS! Sending response.');
            res.json({ token, role: user.role, userId: user.id, name: user.name });
        });
    } catch (err) {
        console.error('=== LOGIN ERROR ===');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});


module.exports = router;
