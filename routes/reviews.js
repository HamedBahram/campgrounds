const express = require('express')
const isLoggedIn = require('../middleware/isLoggedIn')
const isReviewOwner = require('../middleware/isReviewOwner')
const sanitize = require('../middleware/sanitizeHTML')
const validateReview = require('../middleware/validateReview')
const { createNewReview, deleteReview } = require('../controllers/reviews')

// makes parent params available to child routes
const router = express.Router({ mergeParams: true })

router.post('/', isLoggedIn, sanitize, validateReview, createNewReview)
router.delete('/:reviewId', isLoggedIn, isReviewOwner, deleteReview)

module.exports = router
