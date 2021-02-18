const express = require('express')
const isLoggedIn = require('../middleware/isLoggedIn')
const isReviewOwner = require('../middleware/isReviewOwner')
const validateReview = require('../middleware/validateReview')
const { createNewReview, deleteReview } = require('../controllers/reviews')

const mongoSanitize = require('express-mongo-sanitize')

// makes parent params available to child routes
const router = express.Router({ mergeParams: true })

router.post(
    '/',
    isLoggedIn,
    validateReview,
    (req, res, next) => {
        mongoSanitize.sanitize(req.body.review)
        next()
    },
    createNewReview
)
router.delete('/:reviewId', isLoggedIn, isReviewOwner, deleteReview)

module.exports = router
