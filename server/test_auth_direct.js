const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    identityCommitment: { type: String, default: null },
    isOnChain: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

async function testAuth() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const email = 'student@test.com';
    const password = 'Test@123';

    console.log(`Testing login for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
        console.log('User not found!');
        await mongoose.disconnect();
        return;
    }

    console.log('User found:', user.email);
    console.log('Role:', user.role);
    console.log('Password hash exists:', !!user.passwordHash);
    console.log('Hash length:', user.passwordHash?.length);
    console.log('Hash preview:', user.passwordHash?.substring(0, 20) + '...');

    try {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log('\nPassword match:', isMatch);
    } catch (e) {
        console.log('\nPassword comparison error:', e.message);
    }

    await mongoose.disconnect();
    console.log('\nDone');
}

testAuth().catch(console.error);
