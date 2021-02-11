require('dotenv').config()
const express = require('express')
const path = require('path')
const methodOverride = require('method-override')
const AppError = require('./utils/AppError')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const morgan = require('morgan')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const User = require('./models/user')
const campgroundsRouter = require('./routes/campgrounds')
const reviewsRouter = require('./routes/reviews')
const usersRouter = require('./routes/users')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Initialize app
const app = express()

// Database
const URI = process.env.MONGODB_URI
mongoose.connect(URI, {
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
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'lax',
    },
}
if (app.get('env') === 'production') sessionConfig.cookie.secure = true
app.use(session(sessionConfig))
app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email })
            if (!user) return done(null, false, { message: 'Invalid email or password' })
            if (!user.verified) {
                return done(null, false, { message: 'Please check your inbox to verify your email first.' })
            }
            const match = await bcrypt.compare(password, user.password)
            if (match) return done(null, user)
            done(null, false, { message: 'Invalid email or password' })
        } catch (e) {
            done(e)
        }
    })
)
passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

// flash messages
app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// Routes
app.use('/', usersRouter)
app.use('/campgrounds', campgroundsRouter)
app.use('/campgrounds/:id/reviews', reviewsRouter)

// 404 Page
// app.all('*', (req, res, next) => {
//     throw new AppError(404, 'Page Not Found')
// })

// Error Handling
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Something went wrong'
    console.log(err)
    res.status(statusCode).render('error', { err })
})

// Start Server
const port = process.env.PORT || 3000
app.listen(port, () => console.log('serving on port 3000'))
