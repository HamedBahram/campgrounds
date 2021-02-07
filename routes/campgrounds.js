const express = require('express')
const router = express.Router()
const AppError = require('../utils/AppError')
const Campground = require('../models/campground')
const Review = require('../models/review.model')
const { campJoiSchema } = require('../utils/joi_schemas')

const validateCamp = (req, res, next) => {
    const { error } = campJoiSchema.validate(req.body)
    if (error) throw new AppError(400, error.details[0].message)
    next()
}

router.get('/', async (req, res, next) => {
    try {
        const campgrounds = await Campground.find()
        res.render('campgrounds/index', { campgrounds })
    } catch (e) {
        next(e)
    }
})

// If you put this route after :id route it won't work, since it treats "new" as an id
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findById(id).populate('reviews')
        if (!camp) {
            req.flash('error', 'Could not locate the camp')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', { camp })
    } catch (e) {
        next(e)
    }
})

router.post('/', validateCamp, async (req, res, next) => {
    try {
        const camp = new Campground(req.body.campground)
        await camp.save()
        req.flash('success', 'New Camp was successfully created.')
        res.redirect(`/campgrounds/${camp._id}`)
    } catch (e) {
        next(e)
    }
})

router.get('/:id/edit', async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findById(id)
        if (!camp) {
            req.flash('error', 'Could not locate the camp')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/edit', { camp })
    } catch (e) {
        next(e)
    }
})

router.patch('/:id', validateCamp, async (req, res, next) => {
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

router.delete('/:id', async (req, res, next) => {
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
