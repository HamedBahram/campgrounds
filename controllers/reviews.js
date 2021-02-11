const Campground = require('../models/campground')
const Review = require('../models/review.model')

const reviewsController = {
    createNewReview: async (req, res) => {
        try {
            const { id } = req.params
            const camp = await Campground.findById(id)
            if (!camp) {
                req.flash('error', 'Camp not found!')
                return res.redirect('/campgrounds')
            }
            const review = new Review(req.body.review)
            review.user = req.user._id
            await review.save()
            camp.reviews.push(review)
            await camp.save()
            req.flash('success', 'your review was successfully created.')
            res.redirect(`/campgrounds/${camp._id}`)
        } catch (e) {
            next(e)
        }
    },
    deleteReview: async (req, res) => {
        try {
            const { id, reviewId } = req.params
            await Review.findByIdAndDelete(reviewId)
            await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
            req.flash('success', 'your review was successfully deleted.')
            res.redirect(`/campgrounds/${id}`)
        } catch (e) {
            next(e)
        }
    },
}

module.exports = reviewsController
