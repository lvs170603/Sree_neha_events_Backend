const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const { upload, cloudinary } = require('../config/cloudinary');

// GET all services
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new service (Admin)
router.post('/', [auth, upload.single('imageFile')], async (req, res) => {
    let imagePath = req.body.image;
    let publicId = null;

    if (req.file) {
        imagePath = req.file.path;
        publicId = req.file.filename;
    }

    const service = new Service({
        title: req.body.title,
        image: imagePath,
        publicId: publicId,
        category: req.body.category,
        price: req.body.price,
        duration: req.body.duration,
        location: req.body.location,
        youtubeLink: req.body.youtubeLink,
        description: req.body.description,
        terms: req.body.terms,
        fromYourEnd: req.body.fromYourEnd,
    });

    try {
        const newService = await service.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET a specific service
router.get('/:id', getService, (req, res) => {
    res.json(res.service);
});

// PUT update a service (Admin)
router.put('/:id', [auth, upload.single('imageFile'), getService], async (req, res) => {
    if (req.body.title != null) res.service.title = req.body.title;

    if (req.file) {
        // Destroy old image from Cloudinary if it exists
        if (res.service.publicId) {
            try { await cloudinary.uploader.destroy(res.service.publicId); } catch (e) { }
        }
        res.service.image = req.file.path;
        res.service.publicId = req.file.filename;
    } else if (req.body.image != null) {
        res.service.image = req.body.image;
    }

    if (req.body.category != null) res.service.category = req.body.category;
    if (req.body.price != null) res.service.price = req.body.price;
    if (req.body.duration != null) res.service.duration = req.body.duration;
    if (req.body.location != null) res.service.location = req.body.location;
    if (req.body.youtubeLink != null) res.service.youtubeLink = req.body.youtubeLink;
    if (req.body.description != null) res.service.description = req.body.description;
    if (req.body.terms != null) res.service.terms = req.body.terms;
    if (req.body.fromYourEnd != null) res.service.fromYourEnd = req.body.fromYourEnd;

    try {
        const updatedService = await res.service.save();
        res.json(updatedService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a service (Admin)
router.delete('/:id', [auth, getService], async (req, res) => {
    try {
        if (res.service.publicId) {
            try {
                await cloudinary.uploader.destroy(res.service.publicId);
            } catch (err) {
                console.error('[DELETE] Cloudinary delete error:', err);
            }
        }

        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted Service' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Middleware to get service by ID
async function getService(req, res, next) {
    let service;
    try {
        service = await Service.findById(req.params.id);
        if (service == null) {
            return res.status(404).json({ message: 'Cannot find service' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.service = service;
    next();
}

module.exports = router;
