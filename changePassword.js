require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const newPassword = process.argv[2];

if (!newPassword) {
    console.error('Please provide a new password as an argument.');
    console.error('Usage: node changePassword.js <new_password>');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/srinehaevents')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const changePassword = async () => {
    try {
        const adminEmail = 'admin@srinehaevents.com'; // or pass email as arg
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.error('Admin user not found!');
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();
        console.log(`Password for ${adminEmail} updated successfully.`);
        process.exit();
    } catch (err) {
        console.error('Error updating password:', err);
        process.exit(1);
    }
};

changePassword();
