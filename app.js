const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const AppError = require('./utils/AppError')
const mongoose = require('mongoose')
const session = require('express-session')
const morgan = require('morgan')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

// Initialize app
const app = express()

// Database
mongoose.connect('mongodb://localhost:27017/camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('database connected'))

// app configuration
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
process.env.NODE_ENV !== 'production' && app.use(morgan('dev'))

const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'strict',
    },
}
if (app.get('env') === 'production') sessionConfig.cookie.secure = true
app.use(session(sessionConfig))

// Routes
app.get('/', (req, res) => res.render('home'))
app.use('/campgrounds', campgrounds)
// route parameters are scoped to each router, therefore the app params are not
// accessible in reviews router unless we pass {mergeParams: true} when creating
// reviews router to have access to app params
app.use('/campgrounds/:id/reviews', reviews)

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

// Start Server
app.listen(3000, () => console.log('serving on port 3000'))
