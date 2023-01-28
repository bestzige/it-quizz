const fs = require('fs')
const Quizz = require('../models/quizz.model')
const Question = require('../models/question.model')
const Result = require('../models/result.model')
const User = require('../models/user.model')

exports.createQuestion = async(req, res) => {
    try {
        let { quizz } = req.body

        if (!quizz) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizzData
        if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
            quizzData = await Quizz.findOne({ slug: quizz })
        } else {
            quizzData = await Quizz.findOne({ _id: quizz })
        }

        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const title = 'คำถาม'
        const description = 'คำอธิบาย'
        const newQuestion = new Question({
            quizz: quizzData._id,
            title,
            description,
            choices: [
                { title: 'ตัวเลือกที่ 1', isCorrect: true },
                { title: 'ตัวเลือกที่ 2', isCorrect: false },
                { title: 'ตัวเลือกที่ 3', isCorrect: false },
                { title: 'ตัวเลือกที่ 4', isCorrect: false },
            ],
        })

        const data = await newQuestion.save()

        return res.status(200).json({
            data,
            message: 'เพิ่มคำถามสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getUserQuestions = async(req, res) => {
    try {
        let { slug } = req.params

        if (!slug) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสห้องสอบ!',
            })
        }

        slug = slug.trim()
        const quizzData = await Quizz.findOne({ slug })
        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const user = await User.findOne({ _id: req.user._id })
        if (!user) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const isJoined = await Result.findOne({
            user: user._id,
            quizz: quizzData._id,
        })
        if (!isJoined) {
            return res.status(400).json({
                message: 'คุณยังไม่ได้เข้าร่วมห้องสอบ!',
            })
        }

        const data = await Question.find({ quizz: quizzData._id })
            .populate('quizz')
            .select('-choices.isCorrect')

        return res.status(200).json({ data })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getQuestions = async(req, res) => {
    try {
        let { search, quizz } = req.query

        let data
        let quizzId
        if (quizz) {
            const quizzData = await Quizz.findOne({ slug: quizz })
            quizzId = quizzData._id
        }
        if (search && !quizz) {
            data = await Question.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }).populate('quizz')
        } else if (!search && quizz) {
            data = await Question.find({
                quizz: quizzId,
            }).populate('quizz')
        } else if (search && quizz) {
            data = await Question.find({
                quizz: quizzId,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }).populate('quizz')
        } else {
            data = await Question.find({}).populate('quizz')
        }

        return res.status(200).json({ data })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getQuestion = async(req, res) => {
    try {
        let { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสคำถามไม่ถูกต้อง!',
            })
        }

        const data = await Question.findOne({ _id: id }).populate('quizz')

        if (!data) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        return res.status(200).json({ data })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.updateQuestion = async(req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสคำถามไม่ถูกต้อง!',
            })
        }

        let { quizz, title, description, image } = req.body

        if (!title || !quizz) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        const question = await Question.findOne({
            _id: id,
        })

        if (!question) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสห้องสอบไม่ถูกต้อง!',
            })
        }

        const quizzData = await Quizz.findOne({ _id: quizz })
        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        let imageUrl = image
        if (image && image.startsWith('data:image')) {
            if (!image.match(/^data:image\/(png|jpeg|gif|jpg);base64,/)) {
                return res.status(400).send({
                    message: 'รูปภาพไม่ถูกต้อง อนุญาติเฉพาะ (png, jpeg, gif, jpg)',
                })
            }

            const base64Data = image.replace(
                /^data:image\/(png|jpeg|gif|jpg);base64,/,
                ''
            )
            const fileName = `${quizzData.slug}_question_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            if (question.image) {
                const oldImage = question.image.replace(
                    `${process.env.API_URL}/uploads/`,
                    ''
                )
                if (fs.existsSync(`./uploads/${oldImage}`)) {
                    fs.unlinkSync(`./uploads/${oldImage}`)
                }
            }

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        question.quizz = quizz
        question.title = title
        question.description = description
        if (imageUrl) {
            question.image = imageUrl
        }

        const data = await question.save()

        return res.status(200).json({
            data,
            message: 'แก้ไขคำถามสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.deleteQuestion = async(req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสห้องสอบไม่ถูกต้อง!',
            })
        }

        const question = await Question.findOne({
            _id: id,
        })

        if (!question) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        if (question.image) {
            const oldImage = question.image.replace(
                `${process.env.API_URL}/uploads/`,
                ''
            )
            if (fs.existsSync(`./uploads/${oldImage}`)) {
                fs.unlinkSync(`./uploads/${oldImage}`)
            }
        }

        const data = await question.remove()

        return res.status(200).json({
            data,
            message: 'ลบคำถามสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}