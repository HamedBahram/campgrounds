const Joi = require('joi')

module.exports = {
    campJoiSchema: Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            price: Joi.number().min(0).required(),
            image: Joi.string().uri().required(),
            description: Joi.string().required(),
        }).required(),
    }),
    reviewSchema: Joi.object({
        review: Joi.object({
            rating: Joi.number().min(0).max(5).required(),
            body: Joi.string().required(),
        }).required(),
    }),
}
