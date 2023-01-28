const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

exports.isAuth = async(req, res, next) => {
    try {
        const token =
            req.headers &&
            req.headers.authorization &&
            req.headers.authorization.split(' ')[1]

        if (!token) {
            return res.status(401).json({
                message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง!',
            })
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        if (!payload) {
            return res.status(401).json({
                message: 'โทเค็นไม่ถูกต้อง!',
            })
        }

        const user = await User.findOne({ _id: payload.id }).select('-password')

        if (!user) {
            return res.status(401).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        req.user = user

        next()
    } catch (error) {
        console.error(error)
        return res.status(401).json({
            message: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง!',
        })
    }
}

exports.isAdmin = async(req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user._id })
        if (!user.isAdmin) {
            return res.status(403).json({
                message: 'ไม่มีสิทธิ์เข้าถึง!',
            })
        }

        next()
    } catch (error) {
        console.error(error)
        return res.status(403).json({
            message: 'ไม่มีสิทธิ์เข้าถึง!',
        })
    }
}