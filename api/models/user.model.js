const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 255,
        lowercase: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    avatar: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    currentQuizz: {
        type: String,
    },
}, { timestamps: true, versionKey: false, collection: 'users' })

const schema = mongoose.model('user', userSchema)

module.exports = schema