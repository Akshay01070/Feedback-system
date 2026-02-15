const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    identityCommitment: { type: String, default: null }, // Stored after identity creation
    isOnChain: { type: Boolean, default: false }, // Tracks if added to Semaphore group
});

module.exports = mongoose.model('User', UserSchema);
