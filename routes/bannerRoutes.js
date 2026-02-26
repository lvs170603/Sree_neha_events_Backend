const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const auth = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

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

    const banner = new Banner({
        imageUrl: req.file.path,
        publicId: req.file.filename,
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

        if (banner.publicId) {
            try {
                await cloudinary.uploader.destroy(banner.publicId);
            } catch (err) {
                console.error('[BANNER DELETE] Cloudinary delete error:', err);
            }
        }

        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
