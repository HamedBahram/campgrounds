const { reviewSchema } = require('../utils/joi_schemas')
const AppError = require('../utils/AppError')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) throw new AppError(400, error.details[0].message)
    next()
}

module.exports = validateReview
