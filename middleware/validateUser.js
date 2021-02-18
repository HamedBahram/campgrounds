const { userSchema } = require('../utils/joi_schemas')

const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body)
    if (error) {
        req.flash('error', error.details[0].message)
        res.redirect(req.originalUrl)
    } else {
        next()
    }
}

module.exports = validateUser
