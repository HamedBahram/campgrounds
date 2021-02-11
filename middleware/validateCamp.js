const { campJoiSchema } = require('../utils/joi_schemas')
const AppError = require('../utils/AppError')

const validateCamp = (req, res, next) => {
    const { error } = campJoiSchema.validate(req.body)
    if (error) throw new AppError(400, error.details[0].message)
    next()
}

module.exports = validateCamp
