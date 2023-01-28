const express = require('express')
const {
    createSubject,
    getSubjects,
    getSubject,
    deleteSubject,
    updateSubject,
} = require('../controllers/subject.controller')
const { isAuth, isAdmin } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/subject', getSubjects)
router.get('/subject/:find', getSubject)
router.post('/subject', isAuth, isAdmin, createSubject)
router.patch('/subject/:id', isAuth, isAdmin, updateSubject)
router.delete('/subject/:id', isAuth, isAdmin, deleteSubject)

module.exports = router