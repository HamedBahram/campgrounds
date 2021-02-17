const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email_token: {
        type: String,
    },
    reset_token: {
        type: String,
    },
    reset_token_expiry: {
        type: Date,
    },
    verified: {
        type: Boolean,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User
