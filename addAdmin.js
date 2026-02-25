require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const newAdminEmail = process.argv[2];

if (!newAdminEmail) {
    console.error('Please provide an email address as an argument.');
    console.error('Usage: node addAdmin.js <email@example.com>');
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/srinehaevents')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const addAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: newAdminEmail });

        if (existingAdmin) {
            console.log(`Admin user with email ${newAdminEmail} already exists.`);
        } else {
            const admin = new User({
                email: newAdminEmail
            });
            await admin.save();
            console.log(`Successfully added ${newAdminEmail} as an admin!`);
        }
        process.exit();
    } catch (err) {
        console.error('Error adding admin:', err);
        process.exit(1);
    }
};

addAdmin();
