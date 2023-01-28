const mongoose = require('mongoose')

const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
}, { timestamps: true, versionKey: false, collection: 'subjects' })

const schema = mongoose.model('subject', subjectSchema)

module.exports = schema