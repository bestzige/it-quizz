const mongoose = require('mongoose')

const moment = require('moment-timezone')

const resultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    quizz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'quizz',
        required: true,
    },
    joined_at: {
        type: Date,
        default: moment.tz(Date.now(), 'Asia/Bangkok'),
    },
    submitted_at: {
        type: Date,
        default: moment.tz(Date.now(), 'Asia/Bangkok'),
    },
    state: {
        type: String,
        enum: ['pending', 'submitted', 'lated'],
        default: 'pending',
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'group',
    },
    score: {
        type: Number,
        default: 0,
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'question',
        },
        answer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'question.choices',
        },
    }, ],
}, { timestamps: true, versionKey: false, collection: 'results' })

const schema = mongoose.model('result', resultSchema)

module.exports = schema