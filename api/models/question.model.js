const mongoose = require('mongoose')
const { generateUUID } = require('../utils/bestzige.util')

const questionSchema = new mongoose.Schema({
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
    image: {
        type: String,
    },
    choices: [{
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
        isCorrect: {
            type: Boolean,
            default: false,
        },
    }, ],
}, { timestamps: true, versionKey: false, collection: 'questions' })

const schema = mongoose.model('question', questionSchema)

module.exports = schema