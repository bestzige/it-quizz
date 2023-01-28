const mongoose = require('mongoose')

const quizzSchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true,
    },
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
    start_at: {
        type: Date,
        default: Date.now(),
    },
    end_at: {
        type: Date,
		default: Date.now(),
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    total_questions: {
        type: Number,
    },
}, { timestamps: true, versionKey: false, collection: 'quizzes' })

const schema = mongoose.model('quizz', quizzSchema)

module.exports = schema