const express = require('express')
const {
    getUserResultByQUizz,
    getAllResultByQuizz,
    exportUserData,
    clearUser,
} = require('../controllers/result.controller')
const { isAuth, isAdmin } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/result/:quizz/:user', isAuth, isAdmin, getUserResultByQUizz)
router.get('/result/:quizz', isAuth, isAdmin, getAllResultByQuizz)
router.get('/export/result/:quizz/:group/:token', exportUserData)
router.post('/clear/result/:quizz', isAuth, isAdmin, clearUser)

module.exports = router