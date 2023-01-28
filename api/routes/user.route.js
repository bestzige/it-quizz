const express = require('express')
const {
    auth,
    authCallback,
    profile,
    addAdmin,
    removeAdmin,
    getAllAdmin,
    getAllUserResult,
} = require('../controllers/user.controller')
const { isAuth, isAdmin } = require('../middlewares/auth.middleware')
const router = express.Router()

router.get('/auth', auth)
router.get('/auth/callback', authCallback)
router.get('/user/profile', isAuth, profile)
router.put('/user/admin', isAuth, isAdmin, addAdmin)
router.delete('/user/admin/:username', isAuth, isAdmin, removeAdmin)
router.get('/user/admin', isAuth, isAdmin, getAllAdmin)
router.get('/user/result', isAuth, getAllUserResult)

module.exports = router