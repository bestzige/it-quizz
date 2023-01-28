const express = require('express')
const {
    getQuizzes,
    getQuizz,
    createQuizz,
    updateQuizz,
    deleteQuizz,
    joinQuizz,
    getPendingQuizz,
    getQuizzState,
    submitQuizz,
} = require('../controllers/quizz.controller')
const { isAuth, isAdmin } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/quizz', getQuizzes)
router.get('/quizz/:find', getQuizz)
router.post('/quizz/:quizzId/join', isAuth, joinQuizz)
router.get('/quizz/:quizzId/state', isAuth, getQuizzState)
router.post('/quizz/:quizzId/submit', isAuth, submitQuizz)
router.get('/quizz/pending', isAuth, getPendingQuizz)
router.post('/quizz', isAuth, isAdmin, createQuizz)
router.patch('/quizz/:id', isAuth, isAdmin, updateQuizz)
router.delete('/quizz/:id', isAuth, isAdmin, deleteQuizz)

module.exports = router