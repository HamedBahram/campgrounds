const sanitizeHTML = require('sanitize-html')

const sanitize = (req, res, next) => {
    const review = req.body.review
    for (let key in review) {
        review[key] = sanitizeHTML(review[key], {
            allowedTags: [],
            allowedAttributes: {},
        })
    }

    const camp = req.body.campground
    for (let key in camp) {
        camp[key] = sanitizeHTML(camp[key], {
            allowedTags: [],
            allowedAttributes: {},
        })
    }

    const params = req.params
    for (let key in params) {
        params[key] = sanitizeHTML(params[key], {
            allowedTags: [],
            allowedAttributes: {},
        })
    }

    const query = req.query
    for (let key in query) {
        query[key] = sanitizeHTML(query[key], {
            allowedTags: [],
            allowedAttributes: {},
        })
    }
    next()
}

module.exports = sanitize
