const Review = require('../models/review.model')

const isReviewOwner = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params
        const review = await Review.findById(reviewId)
        if (!review) {
            req.flash('error', 'Review not found!')
            return res.redirect(`/campgrounds/${id}`)
        }
        if (!review.user.equals(req.user._id)) {
            req.flash('error', "You don't have enough permission!")
            return res.redirect(`/campgrounds/${id}`)
        }
        next()
    } catch (e) {
        next(e)
    }
}

module.exports = isReviewOwner
