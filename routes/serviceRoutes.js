const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

// Setup Multer Storage for Service Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'service-' + Date.now() + path.extname(file.originalname));
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
    // Determine the image path: use uploaded file if exists, otherwise fallback to the provided URL/string
    let imagePath = req.body.image;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    }

    const service = new Service({
        title: req.body.title,
        image: imagePath,
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

    // Update image if a new file is uploaded, otherwise update if a new text URL is provided
    if (req.file) {
        // Optionally: delete old image file here if it exists in /uploads/
        res.service.image = `/uploads/${req.file.filename}`;
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
    console.log(`[DELETE] Received delete request for service ID: ${req.params.id}`);
    try {
        // Optional: Delete physical file if it's local
        if (res.service.image && res.service.image.startsWith('/uploads/')) {
            console.log(`[DELETE] Attempting to delete physical file: ${res.service.image}`);
            try {
                const filePath = path.join(__dirname, '..', res.service.image);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`[DELETE] Physical file deleted: ${filePath}`);
                } else {
                    console.log(`[DELETE] Physical file not found at: ${filePath}`);
                }
            } catch (fileErr) {
                console.error('[DELETE] Error deleting physical file:', fileErr);
            }
        } else {
            console.log(`[DELETE] No physical file to delete. Image path: ${res.service.image}`);
        }

        console.log(`[DELETE] Calling findByIdAndDelete for ID: ${req.params.id}`);
        await Service.findByIdAndDelete(req.params.id);
        console.log(`[DELETE] Successfully deleted service ID: ${req.params.id}`);
        res.json({ message: 'Deleted Service' });
    } catch (err) {
        console.error('[DELETE] Error deleting service:', err);
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
