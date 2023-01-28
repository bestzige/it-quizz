const express = require('express')
const {
    addChoice,
    updateChoice,
    deleteChoice,
    getChoice,
} = require('../controllers/choice.controller')
const { isAuth, isAdmin } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/choice/:questionId/:choiceId', isAuth, isAdmin, getChoice)
router.post('/choice/:questionId', isAuth, isAdmin, addChoice)
router.patch('/choice/:questionId/:choiceId', isAuth, isAdmin, updateChoice)
router.delete('/choice/:questionId/:choiceId', isAuth, isAdmin, deleteChoice)

module.exports = router