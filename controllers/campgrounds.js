const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

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
            const camp = new Campground({
                ...req.body.campground,
                user: req.user._id,
                images: req.files.map(f => ({ url: f.path, filename: f.filename })),
            })
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
            const { camp } = req
            const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }))
            const { deleteImages } = req.body
            let updatedImages
            if (deleteImages) {
                updatedImages = camp.images.filter(img => !deleteImages.includes(img.filename)).concat(newImages)
                for (let filename of deleteImages) {
                    await cloudinary.uploader.destroy(filename)
                }
            } else {
                updatedImages = camp.images.concat(newImages)
            }

            await camp.updateOne({
                ...req.body.campground,
                images: updatedImages,
            })
            // to pull an element out of an array
            // await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

            req.flash('success', 'Camp was successfully updated.')
            res.redirect(`/campgrounds/${camp._id}`)
        } catch (e) {
            next(e)
        }
    },
    deleteCamp: async (req, res, next) => {
        try {
            const { camp } = req
            await camp.deleteOne()
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
