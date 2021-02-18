const express = require('express')
const passport = require('passport')
const validateUser = require('../middleware/validateUser')
const sanitizeEmail = require('../middleware/sanitizeEmail')
const validateEmail = require('../middleware/validateEmail')
const {
    registerForm,
    createNewUser,
    loginForm,
    login,
    verifyEmail,
    logout,
    resendEmailForm,
    resendVerificationEmail,
} = require('../controllers/users')

const router = express.Router()

router.get('/', (req, res) => res.render('home'))

router.get('/register', registerForm)
router.post('/register', validateUser, sanitizeEmail, validateEmail, createNewUser)

router.get('/login', loginForm)
router.post(
    '/login',
    sanitizeEmail,
    validateEmail,
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
    }),
    login
)

router.get('/verify', verifyEmail)

router.get('/resend', resendEmailForm)
router.post('/resend', resendVerificationEmail)

router.get('/logout', logout)

module.exports = router
