const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const AppError = require('./utils/AppError')
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

app.get('/campgrounds', async (req, res, next) => {
  try {
    const campgrounds = await Campground.find()
    res.render('campgrounds/index', { campgrounds })
  } catch (e) {
    next(e)
  }
})

// If you put this route after :id route it won't work, since it treats "new" as an id
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.get('/campgrounds/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/show', { camp })
  } catch (e) {
    next(e)
  }
})

app.post('/campgrounds', async (req, res, next) => {
  try {
    const { title, location, price, image, description } = req.body.campground
    const camp = new Campground({ title, location, price, image, description })
    await camp.save()
    // we always redirect from routes other than GET
    res.redirect(`/campgrounds/${camp._id}`)
  } catch (e) {
    next(e)
  }
})

app.get('/campgrounds/:id/edit', async (req, res, next) => {
  try {
    const { id } = req.params
    const camp = await Campground.findById(id)
    res.render('campgrounds/edit', { camp })
  } catch (e) {
    next(e)
  }
})

app.patch('/campgrounds/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, location, price, image, description } = req.body.campground
    const camp = await Campground.findByIdAndUpdate(
      id,
      { title, location, price, image, description },
      { new: true, runValidators: true }
    )
    res.redirect(`/campgrounds/${camp._id}`)
  } catch (e) {
    next(e)
  }
})

app.delete('/campgrounds/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const camp = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
  } catch (e) {
    next(e)
  }
})

// 404 Page
app.all('*', (req, res, next) => {
  next(new AppError(404, 'Page Not Found'))
})

// Error Handling
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = 'Something went wrong'
  res.status(statusCode).render('error', { err })
})

// Listen
app.listen(3000, () => console.log('serving on port 3000'))
