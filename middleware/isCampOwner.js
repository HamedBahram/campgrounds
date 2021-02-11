const Campground = require('../models/campground')

const isCampOwner = async (req, res, next) => {
    try {
        const { id } = req.params
        const camp = await Campground.findById(id)
        if (!camp) {
            req.flash('error', 'Camp not found!')
            return res.redirect('/campgrounds')
        }
        if (!camp.user.equals(req.user._id)) {
            req.flash('error', "You don't have enough permission!")
            return res.redirect(`/campgrounds/${camp._id}`)
        }
        next()
    } catch (e) {
        next(e)
    }
}

module.exports = isCampOwner
