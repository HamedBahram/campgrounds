const mongoose = require('mongoose')
const Review = require('./review.model')
const Schema = mongoose.Schema

const imageSchema = new Schema({
    url: String,
    filename: String,
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_175,c_fill,g_auto,f_auto')
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
})

campgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({ _id: { $in: camp.reviews } })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)
module.exports = Campground
