const express = require('express')
const router = express.Router({ mergeParams: true })
// mergeParams 	Preserve the req.params values from the parent router.
// If the parent and the child have conflicting param names,
// the child’s value take precedence.
const AppError = require('../utils/AppError')
const Campground = require('../models/campground')
const Review = require('../models/review.model')
const { reviewSchema } = require('../utils/joi_schemas')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) throw new AppError(400, error.details[0].message)
    next()
}

router.post('/', validateReview, async (req, res) => {
    try {
        const { id } = req.params
        const camp = await Campground.findById(id)
        const review = new Review(req.body.review)
        await review.save()
        camp.reviews.push(review)
        await camp.save()
        req.flash('success', 'your review was successfully created.')
        res.redirect(`/campgrounds/${camp._id}`)
    } catch (e) {
        next(e)
    }
})

router.delete('/:reviewId', async (req, res) => {
    try {
        const { id, reviewId } = req.params
        await Review.findByIdAndDelete(reviewId)
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
        req.flash('success', 'your review was successfully deleted.')
        res.redirect(`/campgrounds/${id}`)
    } catch (e) {
        next(e)
    }
})

module.exports = router
