const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');
const auth = require('../middleware/auth');

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|gif/i;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

        if (extname || mimetype) {
            return cb(null, true);
        } else {
            console.error(`[MULTER REJECT] Blocked file upload. file.originalname: ${file.originalname}, file.mimetype: ${file.mimetype}`);
            cb(new Error('Images Only!'));
        }
    }
});

// GET all active banners (Public)
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new banner (Admin)
router.post('/', [auth, upload.single('image')], async (req, res) => {
    console.log('[BANNER UPLOAD] Received request', req.file);
    if (!req.file) {
        console.error('[BANNER UPLOAD] No req.file found. Maybe multer rejected it?');
        return res.status(400).json({ message: 'No image provided' });
    }

    // Create the URL path that the frontend will use to access the image
    const imageUrl = `/uploads/${req.file.filename}`;

    const banner = new Banner({
        imageUrl: imageUrl,
        isActive: true
    });

    try {
        const newBanner = await banner.save();
        res.status(201).json(newBanner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a banner (Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        // Delete file from filesystem
        if (banner.imageUrl && banner.imageUrl.startsWith('/uploads/')) {
            try {
                const filePath = path.join(__dirname, '..', banner.imageUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fileErr) {
                console.error('[BANNER DELETE] Error deleting physical file:', fileErr);
            }
        }

        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
