const mongoose = require('mongoose')
const Review = require('./review.model')
const Schema = mongoose.Schema

const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
})

campgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({ _id: { $in: camp.reviews } })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)
module.exports = Campground
