const sanitizeHTML = require('sanitize-html')

const sanitizeEmail = (req, res, next) => {
    req.body.email = sanitizeHTML(req.body.email, {
        allowedTags: [],
        allowedAttributes: {},
    })
    next()
}

module.exports = sanitizeEmail
