const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Configure Nodemailer transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Send OTP Route
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        // Find user (Only allow existing admins to request OTP)
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email address not found or not authorized.' });
        }

        const otp = generateOTP();
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        // Save OTP and set expiry to 10 minutes from now
        user.otp = hashedOTP;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Admin Dashboard Login OTP',
            html: `<p>Your One-Time Password (OTP) for the Admin Dashboard is:</p>
                   <h2>${otp}</h2>
                   <p>This code will expire in 10 minutes.</p>
                   <p>If you did not request this, please ignore this email.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully to ' + email });
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({ message: 'Failed to send OTP. Check email configuration.' });
    }
});

// 2. Verify OTP Route
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: 'No OTP requested or OTP expired' });
        }

        // Check expiry
        if (Date.now() > user.otpExpires) {
            // Clear expired OTP
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Compare OTP
        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid! Clear it.
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret_key', { expiresIn: '1d' });

        res.status(200).json({ token, userId: user._id, message: 'Login successful' });
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

module.exports = router;
