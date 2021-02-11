const express = require('express')
const isLoggedIn = require('../middleware/isLoggedIn')
const isReviewOwner = require('../middleware/isReviewOwner')
const validateReview = require('../middleware/validateReview')
const { createNewReview, deleteReview } = require('../controllers/reviews')

// makes parent params available to child routes
const router = express.Router({ mergeParams: true })

router.post('/', isLoggedIn, validateReview, createNewReview)
router.delete('/:reviewId', isLoggedIn, isReviewOwner, deleteReview)

module.exports = router
