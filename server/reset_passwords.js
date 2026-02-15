const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPasswords() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-system');
    console.log('Connected to MongoDB\n');

    const newPassword = 'Test@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const accounts = ['student@test.com', 'teacher@test.com', 'admin@test.com'];

    for (const email of accounts) {
        const result = await mongoose.connection.db.collection('users').updateOne(
            { email },
            { $set: { passwordHash } }
        );
        if (result.modifiedCount > 0) {
            console.log(`✓ Reset password for: ${email}`);
        } else if (result.matchedCount > 0) {
            console.log(`- Password already correct for: ${email}`);
        } else {
            console.log(`✗ User not found: ${email}`);
        }
    }

    console.log('\n========================================');
    console.log('All passwords have been reset to: Test@123');
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('✓ Done');
}

resetPasswords().catch(console.error);
