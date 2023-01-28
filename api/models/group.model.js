const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    quizz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizz',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
}, { timestamps: true, versionKey: false, collection: 'groups' })

const schema = mongoose.model('groups', groupSchema)

module.exports = schema