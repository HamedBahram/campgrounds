const express = require('express')
const crypto = require('crypto')
const passport = require('passport')
const sgMail = require('@sendgrid/mail')
const router = express.Router()
const User = require('../models/user')

router.get('/', (req, res) => res.render('home'))

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body
        const registered = await User.findOne({ email })
        if (registered) {
            req.flash('error', 'A user with this email is already registered')
            return res.redirect('/register')
        }
        const user = new User({
            email,
            email_token: crypto.randomBytes(64).toString('hex'),
            verified: false,
            password,
        })
        await user.save()
        const msg = {
            to: user.email,
            from: {
                email: 'info@nestzoom.com',
                name: 'nest zoom',
            },
            template_id: process.env.SENDGRID_TEMP_ID,
            dynamic_template_data: {
                name: user.name,
                email_token: user.email_token,
            },
        }
        await sgMail.send(msg)
        req.flash('success', 'please check you email to verify your account')
        res.redirect('/login')
    } catch (e) {
        next(e)

        // Instead of passing the error to the error handling middleware
        // you can handle the error, flash a message and redirect here
        // req.flash('error', e.message)
        // res.redirect('/register')
    }
})

router.get('/login', (req, res) => res.render('users/login'))

router.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
    })
)

router.get('/verify', async (req, res, next) => {
    try {
        const { token } = req.query
        const user = await User.findOne({ email_token: token })
        if (!user) {
            req.flash('error', 'Invalid verification Token')
            req.redirect('/register')
        }
        user.email_token = undefined
        user.verified = true
        await user.save()
        req.flash('success', 'Your email is verified, please log in')
        res.redirect('/login')
    } catch (e) {
        next(e)
    }
})

module.exports = router
