const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-system');
    console.log('Connected to MongoDB\n');

    const users = await mongoose.connection.db.collection('users').find({}).toArray();

    console.log('=== Users in Database ===');
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`Role: ${u.role}`);
            console.log('---');
        });
    }
    console.log(`Total: ${users.length} user(s)\n`);

    await mongoose.disconnect();
}

checkUsers().catch(console.error);
