const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Ensure this path is correct
require('dotenv').config();

async function debugLogin() {
    console.log('Starting Debug Script...');
    const email = 'student@test.com';
    const password = 'Test@123';

    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-system');
        console.log('   ✓ Connected.');

        console.log(`2. searching for user: ${email}...`);
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error('   ✗ User NOT FOUND.');
            return;
        }
        console.log('   ✓ User Found:', { 
            id: user._id, 
            email: user.email, 
            role: user.role, 
            name: user.name, // Check if name exists
            hasPassword: !!user.passwordHash 
        });

        console.log('3. Verifying Password...');
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.error('   ✗ Password MISMATCH.');
            return;
        }
        console.log('   ✓ Password Verified.');

        console.log('4. Generating JWT...');
        const payload = { user: { id: user.id, role: user.role } };
        const secret = process.env.JWT_SECRET || 'secret';
        
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        console.log('   ✓ Token Generated.');
        console.log('   ✓ Full Login Flow SUCCESS.');

    } catch (err) {
        console.error('!!! EXCEPTION DURING DEBUG !!!');
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

debugLogin();
