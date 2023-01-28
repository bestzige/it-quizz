const express = require('express')
const {
    getQuestion,
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getUserQuestions,
} = require('../controllers/question.controller')
const { isAuth, isAdmin } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/u-question/:slug', isAuth, getUserQuestions)
router.get('/question', isAuth, isAdmin, getQuestions)
router.get('/question/:id', isAuth, isAdmin, getQuestion)
router.post('/question', isAuth, isAdmin, createQuestion)
router.patch('/question/:id', isAuth, isAdmin, updateQuestion)
router.delete('/question/:id', isAuth, isAdmin, deleteQuestion)

module.exports = router