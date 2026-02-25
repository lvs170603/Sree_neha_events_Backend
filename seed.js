const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

const sampleServices = [
    // Birthday
    {
        title: 'Game Host',
        image: 'https://images.unsplash.com/photo-1544485023-4518423f009f?q=80&w=2670&auto=format&fit=crop',
        category: 'Birthday',
        price: '5000',
        duration: '3 hours',
        setupTime: '30 mins',
        location: 'Anywhere',
        description: 'Engaging game host for birthday parties.',
        terms: 'Advanced booking required.'
    },
    {
        title: 'Magician',
        image: 'https://images.unsplash.com/photo-1542475143-5b8cb8519782?q=80&w=2670&auto=format&fit=crop',
        category: 'Birthday',
        price: '8000',
        duration: '1 hour',
        setupTime: '15 mins',
        location: 'Anywhere',
        description: 'Professional magician for kids and adults.',
        terms: 'Requires stage area.'
    },
    // Wedding
    {
        title: 'Orchestra',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2670&auto=format&fit=crop',
        category: 'Wedding',
        price: '25000',
        duration: '4 hours',
        setupTime: '2 hours',
        location: 'Venue',
        description: 'Live orchestra band for wedding reception.',
        terms: 'Power supply needed.'
    },
    {
        title: 'Photography',
        image: 'https://images.unsplash.com/photo-1520854221250-8c1252a7aa04?q=80&w=2670&auto=format&fit=crop',
        category: 'Photography',
        price: '50000',
        duration: 'Full Day',
        setupTime: 'N/A',
        location: 'Anywhere',
        description: 'Professional wedding photography and videography.',
        terms: 'Album delivery in 30 days.'
    },
    {
        title: 'Catering',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2670&auto=format&fit=crop',
        category: 'Catering',
        price: '500 per plate',
        duration: 'Event duration',
        setupTime: '4 hours',
        location: 'Venue',
        description: 'Delicious vegetarian and non-vegetarian catering.',
        terms: 'Minimum 100 pax.'
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/srinehaevents')
    .then(async () => {
        console.log('Connected to MongoDB');
        await Service.deleteMany({});
        await Service.insertMany(sampleServices);
        console.log('Data seeded!');
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error('Error seeding data:', err);
        mongoose.connection.close();
    });
