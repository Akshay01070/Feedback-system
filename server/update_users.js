const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
});

const User = mongoose.model('User', UserSchema);

async function updateUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback-system');
        console.log('Connected to MongoDB');

        const users = await User.find({ name: { $exists: false } });
        console.log(`Found ${users.length} users without a name.`);

        for (const user of users) {
             // Assign a name based on role or email part
             const name = user.email.split('@')[0]; 
             user.name = name.charAt(0).toUpperCase() + name.slice(1); // "student" -> "Student"
             await user.save();
             console.log(`Updated user ${user.email} with name: ${user.name}`);
        }

        console.log('All users updated.');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

updateUsers();
