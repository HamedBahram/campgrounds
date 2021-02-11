const express = require('express')
const router = express.Router()
const AppError = require('../utils/AppError')
const Campground = require('../models/campground')
const Review = require('../models/review.model')
const { campJoiSchema } = require('../utils/joi_schemas')
const isLoggedIn = require('../middleware/isLoggedIn')
const isCampOwner = require('../middleware/isCampOwner')

const validateCamp = (req, res, next) => {
    const { error } = campJoiSchema.validate(req.body)
    if (error) throw new AppError(400, error.details[0].message)
    next()
}

// router.param('id', async (req, res, next, id) => {
//     try {
//         const camp = await Campground.findById(id)
//         if (!camp) {
//             req.flash('error', 'Camp not found!')
//             return res.redirect('/campgrounds')
//         }
//         req.camp = camp
//         next()
//     } catch (e) {
//         next(e)
//     }
// })

router.get('/', async (req, res, next) => {
    try {
        const campgrounds = await Campground.find()
        res.render('campgrounds/index', { campgrounds })
    } catch (e) {
        next(e)
    }
})

// If you put this route after :id route it won't work, since it treats "new" as an id
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findById(id)
            .populate({ path: 'reviews', populate: { path: 'user' } })
            .populate('user')
        if (!camp) {
            req.flash('error', 'Camp not found!')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', { camp })
    } catch (e) {
        next(e)
    }
})

router.post('/', isLoggedIn, validateCamp, async (req, res, next) => {
    try {
        const camp = new Campground(req.body.campground)
        camp.user = req.user._id
        await camp.save()
        req.flash('success', 'New Camp was successfully created.')
        res.redirect(`/campgrounds/${camp._id}`)
    } catch (e) {
        next(e)
    }
})

router.get('/:id/edit', isLoggedIn, isCampOwner, async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findById(id)
        if (!camp) {
            req.flash('error', 'Camp not found!')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/edit', { camp })
    } catch (e) {
        next(e)
    }
})

router.patch('/:id', isLoggedIn, isCampOwner, validateCamp, async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findByIdAndUpdate(id, req.body.campground, {
            new: true,
            runValidators: true,
        })
        req.flash('success', 'Camp was successfully updated.')
        res.redirect(`/campgrounds/${camp._id}`)
    } catch (e) {
        next(e)
    }
})

router.delete('/:id', isLoggedIn, isCampOwner, async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findByIdAndDelete(id)
        req.flash('success', 'Camp was successfully deleted')
        res.redirect('/campgrounds')
    } catch (e) {
        next(e)
    }
})

module.exports = router
