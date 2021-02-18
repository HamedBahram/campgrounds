const Joi = require('joi')

module.exports = {
    campJoiSchema: Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            price: Joi.number().min(0).required(),
            // images: Joi.array().items(
            //     Joi.object({
            //         url: Joi.string().uri().required(),
            //         filename: Joi.string().required(),
            //     })
            // ),
            description: Joi.string().required(),
        }).required(),
        deleteImages: Joi.array(),
    }),
    reviewSchema: Joi.object({
        review: Joi.object({
            rating: Joi.number().min(0).max(5).required(),
            body: Joi.string().required(),
        }).required(),
    }),
    userSchema: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
}
