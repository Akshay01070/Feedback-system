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
    // Students
    { name: 'Student One',   email: 'student1@test.com',  password: 'Test@123', role: 'student' },
    { name: 'Student Two',   email: 'student2@test.com', password: 'Test@123', role: 'student' },
    { name: 'Student Three', email: 'student3@test.com',  password: 'Test@123', role: 'student' },
    { name: 'Student Four',  email: 'student4@test.com',  password: 'Test@123', role: 'student' },
    { name: 'Student Five',  email: 'student5@test.com',  password: 'Test@123', role: 'student' },

    // Teachers
    { name: 'Dr. Amrendra Singh Yadav',  email: 'teacher1@test.com', password: 'Test@123', role: 'teacher' },
    { name: 'Prof. Joydeep',             email: 'teacher2@test.com', password: 'Test@123', role: 'teacher' },
    { name: 'Dr. Avadh Kishor',          email: 'teacher3@test.com', password: 'Test@123', role: 'teacher' },
    { name: 'Dr. Deepak Kumar Dewangan', email: 'teacher4@test.com', password: 'Test@123', role: 'teacher' },
    { name: 'Prof. Shashikala Tapaswi',  email: 'teacher5@test.com', password: 'Test@123', role: 'teacher' },

    // Admin
    { name: 'Admin User', email: 'admin@test.com', password: 'Test@123', role: 'admin' }
];

async function createAccounts() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-system');
        console.log('✓ Connected to MongoDB\n');

        // Drop ALL collections to start fresh
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const col of collections) {
            await mongoose.connection.db.dropCollection(col.name);
            console.log(`🗑 Dropped collection: ${col.name}`);
        }
        console.log('');

        for (const account of accounts) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(account.password, salt);

            const user = new User({
                name: account.name,
                email: account.email,
                passwordHash,
                role: account.role
            });

            await user.save();
            console.log(`✓ Created ${account.role.toUpperCase().padEnd(7)} : ${account.name} (${account.email})`);
        }

        console.log('\n========================================');
        console.log('Test Account Credentials (all use Test@123)');
        console.log('========================================');
        accounts.forEach(acc => {
            console.log(`${acc.role.toUpperCase().padEnd(8)}: ${acc.email}`);
        });
        console.log('========================================\n');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
    }
}

createAccounts();
