const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const morgan = require('morgan')

const app = express()

// Database
mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('database connected'))

// app configuration
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
process.env.NODE_ENV !== 'production' && app.use(morgan('dev'))

// Routes
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index', { campgrounds })
})

// If you put this route after :id route it won't work, since it treats "new" as an id
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/show', { camp })
})

app.post('/campgrounds', async (req, res) => {
    const { title, location } = req.body.campground
    const camp = new Campground({ title, location })
    await camp.save()
    // we always redirect from routes other than GET
    res.redirect(`/campgrounds/${camp._id}`)
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/edit', { camp })
})

app.patch('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const { title, location } = req.body.campground
    const camp = await Campground.findByIdAndUpdate(
        id,
        { title, location },
        { new: true, runValidators: true }
    )
    res.redirect(`/campgrounds/${camp._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

// Listen
app.listen(3000, () => console.log('serving on port 3000'))
