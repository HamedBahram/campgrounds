const User = require('../models/user')
const crypto = require('crypto')
const sgMail = require('@sendgrid/mail')

const usersController = {
    registerForm: (req, res) => {
        res.render('users/register')
    },
    createNewUser: async (req, res, next) => {
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
            req.flash('success', 'Please check you email to verify your account')
            res.redirect('/login')
        } catch (e) {
            next(e)

            // Instead of passing the error to the error handling middleware
            // you can handle the error, flash a message and redirect here
            // req.flash('error', e.message)
            // res.redirect('/register')
        }
    },
    loginForm: (req, res) => {
        res.render('users/login')
    },
    login: (req, res) => {
        const redirectURL = req.session.redirectTo || '/'
        delete req.session.redirectTo
        res.redirect(redirectURL)
    },
    verifyEmail: async (req, res, next) => {
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
    },
    resendEmailForm: (req, res) => {
        res.render('users/resend')
    },
    resendVerificationEmail: async (req, res) => {
        try {
            const { email } = req.body
            const user = await User.findOne({ email })
            if (!user) {
                req.flash('error', 'There is no account registered with that email')
                return res.redirect('/resend')
            }
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
            req.flash('success', 'Email was resent! please check you inbox.')
            res.redirect('/login')
        } catch (e) {
            next(e)
        }
    },
    logout: (req, res) => {
        req.logout()
        req.flash('success', "You're Logged Out!")
        res.redirect('/login')
    },
}

module.exports = usersController
