const mongoose = require('mongoose')
const Review = require('./review.model')
const Schema = mongoose.Schema

const imageSchema = new Schema(
    {
        url: String,
        filename: String,
    },
    { toJSON: { virtuals: true } }
)

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_175,c_fill,g_auto,f_auto')
})

// Using subdocuments, you can define a common point GeoJSON Schema and reuse it
const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
})

const campgroundSchema = new Schema(
    {
        title: String,
        images: [imageSchema],
        price: Number,
        description: String,
        location: String,
        geometry: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
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
    },
    { toJSON: { virtuals: true } }
)

campgroundSchema.virtual('properties.popupHTML').get(function () {
    return `
    <div class="row g-2">
        <div class="col-6">
            <img src=${this.images[0].thumbnail} class="w-100" alt="">
        </div>
        <div class="col-6">
            <h6 class="m-0">${this.title}</h6>
            <p class="m-0">${this.location}</p>
            <a href="/campgrounds/${this._id}" class="link-info">view camp</a>
        </div>
    </div>`
})

campgroundSchema.index({ geometry: '2dsphere' })

campgroundSchema.post('findOneAndDelete', async function (camp) {
    if (camp) {
        await Review.deleteMany({ _id: { $in: camp.reviews } })
    }
})

const Campground = mongoose.model('Campground', campgroundSchema)
module.exports = Campground
