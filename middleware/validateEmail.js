const validator = require('validator')

function validateEmail(req, res, next) {
    if (
        validator.isEmail(req.body.email, {
            blacklisted_chars: '{}',
        })
    ) {
        return next()
    }
    req.flash('error', 'Please provide a valid Email')
    res.redirect(req.originalUrl)
}

module.exports = validateEmail
