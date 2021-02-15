const e = require('express')
const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

// Database
mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('database connected'))

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            user: '60256c02ccfa141a00b05e60',
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://source.unsplash.com/collection/483251/800x450',
                    filename: 'path/filename_01',
                },
                {
                    url: 'https://source.unsplash.com/collection/483251/799x450',
                    filename: 'path/filename_02',
                },
                {
                    url: 'https://source.unsplash.com/collection/483251/798x450',
                    filename: 'path/filename_03',
                },
            ],
            price: Math.floor(Math.random() * 20) + 10,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, debitis doloremque? Magnam reiciendis enim, aut ratione inventore voluptatem quo eos.',
            location: `${cities[random].city}, ${cities[random].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random].longitude, cities[random].latitude],
            },
        })
        await camp.save()
    }
}

// returns a promise because it is an async funciton
seedDB().then(() => mongoose.connection.close())
