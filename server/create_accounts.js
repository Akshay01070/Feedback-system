const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    isVerified: { type: Boolean, default: false },
    identityCommitment: { type: String, default: null },
    isOnChain: { type: Boolean, default: false },
});

const User = mongoose.model('User', UserSchema);

const accounts = [
    { name: 'Student One', email: 'student@test.com', password: 'Test@123', role: 'student' },
    { name: 'Prof. Joydeep', email: 'teacher@test.com', password: 'Test@123', role: 'teacher' },
    { name: 'Admin User', email: 'admin@test.com', password: 'Test@123', role: 'admin' }
];

async function createAccounts() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-system');
        console.log('✓ Connected to MongoDB\n');

        for (const account of accounts) {
            try {
                // Delete existing user first (to ensure clean data with name field)
                const existing = await User.findOne({ email: account.email });
                if (existing) {
                    await User.deleteOne({ email: account.email });
                    console.log(`🗑 Deleted old ${account.role.toUpperCase()} account: ${account.email}`);
                }

                // Hash password
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(account.password, salt);

                // Create user with name
                const user = new User({
                    name: account.name,
                    email: account.email,
                    passwordHash,
                    role: account.role
                });

                await user.save();
                console.log(`✓ Created ${account.role.toUpperCase()} account: ${account.email} (name: ${account.name})`);
            } catch (err) {
                console.log(`✗ Error creating ${account.role} account: ${err.message}`);
            }
        }

        console.log('\n========================================');
        console.log('Test Account Credentials:');
        console.log('========================================');
        accounts.forEach(acc => {
            console.log(`${acc.role.toUpperCase().padEnd(8)}: ${acc.email} / ${acc.password}`);
        });
        console.log('========================================\n');

    } catch (err) {
        console.error('Connection Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
    }
}

createAccounts();
