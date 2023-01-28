const {
    getRedirectUrl,
    userAuth,
    getUserInfo,
    generateToken,
} = require('../utils/bestzige.util')
const User = require('../models/user.model')
const Subject = require('../models/subject.model')
const Question = require('../models/question.model')
const Result = require('../models/result.model')

exports.addAdmin = async(req, res) => {
    try {
        const { username } = req.body

        const user = await User.findOne({ username })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        user.isAdmin = true

        await user.save()

        return res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Server Error!',
        })
    }
}

exports.removeAdmin = async(req, res) => {
    try {
        const { username } = req.params

        const user = await User.findOne({ username })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        user.isAdmin = false

        await user.save()

        return res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Server Error!',
        })
    }
}

exports.getAllAdmin = async(req, res) => {
    try {
        const admin = await User.find({ isAdmin: true })

        return res.status(200).json({ admin })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Server Error!',
        })
    }
}

exports.getAllUserResult = async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const data = await Result.find({ user: user._id }).populate([
            'user',
            'quizz',
        ])

        let results = []
        let count = 0
        data.forEach(async(result) => {
            const question = await Question.find({ quizz: result.quizz._id })
            const subject = await Subject.findOne({ _id: result.quizz.subject })
            const answersXd = await result.answers.map((answer) => {
                const questionData = question.find(
                    (q) =>
                    q._id.toString() == (answer.question && answer.question.toString())
                )

                if (questionData) {
                    const choice = questionData.choices.find(
                        (c) => c._id.toString() == answer.answer.toString()
                    )

                    return {
                        correct: choice.isCorrect,
                    }
                } else {
                    return {
                        correct: false,
                    }
                }
            })

            const scoreXd = answersXd.filter((a) => a.correct).length

            const totalUser = await Result.find({
                quizz: result.quizz._id,
                group: result.group,
            }).countDocuments()

            results.push({
                ...result._doc,
                answers: null,
                subject: subject,
                score: scoreXd,
                allQuestion: question.length,
                allUser: totalUser,
            })
            count++
        })

        while (count < data.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        results.sort((a, b) => {
            return new Date(b.submitted_at) - new Date(a.submitted_at)
        })

        return res.status(200).json({ results })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Server Error!',
        })
    }
}

exports.profile = async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        return res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Server Error!',
        })
    }
}

exports.auth = async(req, res) => {
    const url = getRedirectUrl()
    console.log(url)
    return res.redirect(url)
}

exports.authCallback = async(req, res) => {
    try {
        const { code } = req.query

        if (!code) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=ไม่พบโค้ด!`)
        }

        const { access_token, id_token } = await userAuth(code.toString())

        if (!access_token || !id_token) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=ไม่พบโทเค็น!`)
        }

        const { email, avatar, nickname, username } = await getUserInfo(
            access_token,
            id_token
        )

        if (!email || !avatar || !nickname || !username) {
            return res.redirect(
                `${process.env.CLIENT_URL}/login?error=ไม่พบข้อมูลผู้ใช้!`
            )
        }

        if (!email.endsWith(process.env.ALLOWED_EMAIL)) {
            return res.redirect(
                `${process.env.CLIENT_URL}/login?error=กรุณาใช้อีเมลล์ของวิทยาลัยเท่านั้น! (${process.env.ALLOWED_EMAIL})!`
            )
        }

        let user = await User.findOne({
            email: email,
        })

        if (!user) {
            const newUser = new User({
                email: email,
                avatar: avatar,
                name: nickname,
                username: username,
                nickname: nickname,
            })

            await newUser.save()

            user = newUser
        } else {
            user.avatar = avatar
            user.username = username
            user.nickname = nickname

            await user.save()
        }

        const token = generateToken(user)

        if (!token) {
            return res.redirect(
                `${process.env.CLIENT_URL}/login?error=การเข้าสู่ระบบล้มเหลว!`
            )
        }

        return res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`)
    } catch (error) {
        console.error(error)
        return res.redirect(
            `${process.env.CLIENT_URL}/login?error=การเข้าสู่ระบบล้มเหลว!`
        )
    }
}