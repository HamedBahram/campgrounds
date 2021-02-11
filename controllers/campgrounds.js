const Campground = require('../models/campground')

const campgroundController = {
    index: async (req, res, next) => {
        try {
            const campgrounds = await Campground.find()
            res.render('campgrounds/index', { campgrounds })
        } catch (e) {
            next(e)
        }
    },
    newForm: (req, res) => {
        res.render('campgrounds/new')
    },
    showCamp: async (req, res, next) => {
        try {
            const { camp } = req
            res.render('campgrounds/show', { camp })
        } catch (e) {
            next(e)
        }
    },
    createNewCamp: async (req, res, next) => {
        try {
            const camp = new Campground(req.body.campground)
            camp.user = req.user._id
            await camp.save()
            req.flash('success', 'New Camp was successfully created.')
            res.redirect(`/campgrounds/${camp._id}`)
        } catch (e) {
            next(e)
        }
    },
    editForm: async (req, res, next) => {
        try {
            const { camp } = req
            res.render('campgrounds/edit', { camp })
        } catch (e) {
            next(e)
        }
    },
    editCamp: async (req, res, next) => {
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
    },
    deleteCamp: async (req, res, next) => {
        try {
            const { id } = req.params
            const camp = await Campground.findByIdAndDelete(id)
            req.flash('success', 'Camp was successfully deleted')
            res.redirect('/campgrounds')
        } catch (e) {
            next(e)
        }
    },
    findCampById: async (req, res, next, id) => {
        try {
            const camp = await Campground.findById(id)
                .populate({ path: 'reviews', populate: { path: 'user' } })
                .populate('user')
            if (!camp) {
                req.flash('error', 'Camp not found!')
                return res.redirect('/campgrounds')
            }
            req.camp = camp
            next()
        } catch (e) {
            next(e)
        }
    },
}

module.exports = campgroundController
