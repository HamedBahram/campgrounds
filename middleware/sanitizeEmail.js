const sanitizeHTML = require('sanitize-html')

const sanitizeEmail = (req, res, next) => {
    sanitizeHTML(req.body.email)
    next()
}

module.exports = sanitizeEmail
