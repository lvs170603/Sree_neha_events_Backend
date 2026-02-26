const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    publicId: {
        type: String
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: String, // Can be a range or fixed price string
    },
    duration: {
        type: String,
    },
    location: {
        type: String,
    },
    youtubeLink: {
        type: String,
    },
    description: {
        type: String,
    },
    terms: {
        type: String,
    },
    fromYourEnd: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
