const fs = require('fs')
const Quizz = require('../models/quizz.model')
const Subject = require('../models/subject.model')
const User = require('../models/user.model')
const Result = require('../models/result.model')
const Question = require('../models/question.model')

exports.createQuizz = async(req, res) => {
    try {
        let { subject, title, description, slug, image } = req.body

        if (!title || !slug || !subject) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let subjectData
        if (!subject.match(/^[0-9a-fA-F]{24}$/)) {
            subjectData = await Subject.findOne({ slug: subject })
        } else {
            subjectData = await Subject.findOne({ _id: subject })
        }

        if (!subjectData) {
            return res.status(400).json({
                message: 'ไม่พบรายวิชา!',
            })
        }

        slug = slug.trim().replace(/\s+/g, '-').toLowerCase()

        const quizz = await Quizz.findOne({ slug })
        if (quizz) {
            return res.status(400).json({
                message: 'รหัสห้องสอบนี้ถูกใช้งานแล้ว!',
            })
        }

        let imageUrl
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
            const fileName = `${subjectData.slug}_${slug}_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        const newQuizz = new Quizz({
            subject: subjectData._id,
            title,
            description,
            slug,
            image: imageUrl,
            start_at: new Date(),
            end_at: new Date(new Date().getTime() + 3600000),
        })

        if (!imageUrl) {
            delete newQuizz.image
        }

        const data = await newQuizz.save()

        return res.status(200).json({
            data,
            message: 'สร้างห้องสอบสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getQuizzes = async(req, res) => {
    try {
        let { search, subject } = req.query

        let data
        let subjectId
        if (subject) {
            const subjectData = await Subject.findOne({ slug: subject })
            if (!subjectData) {
                return res.status(400).json({
                    message: 'ไม่พบรายวิชา!',
                })
            }
            subjectId = subjectData._id
        }
        if (search && !subject) {
            data = await Quizz.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }).populate('subject')
        } else if (!search && subject) {
            data = await Quizz.find({
                subject: subjectId,
            }).populate('subject')
        } else if (search && subject) {
            data = await Quizz.find({
                subject: subjectId,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
            }).populate('subject')
        } else {
            data = await Quizz.find({}).populate('subject')
        }

        return res.status(200).json({ data })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getQuizz = async(req, res) => {
    try {
        let { find } = req.params

        if (!find) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        find = find.trim()
        let data
        const findReq = find.split('_')[1]
        if (find.startsWith('id_')) {
            if (!findReq.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({
                    message: 'รหัสรายวิชาไม่ถูกต้อง!',
                })
            }
            data = await Quizz.findOne({
                _id: findReq,
            }).populate('subject')
        } else {
            data = await Quizz.findOne({
                slug: findReq,
            }).populate('subject')
        }

        if (!data) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const totalQuestion = await Question.countDocuments({
            quizz: data._id,
        })
        data.total_questions = totalQuestion

        return res.status(200).json({ data })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.updateQuizz = async(req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสห้องสอบไม่ถูกต้อง!',
            })
        }

        let {
            subject,
            title,
            description,
            slug,
            image,
            start_at,
            end_at,
            is_active,
        } = req.body

        if (!title || !slug || !subject) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        const quizz = await Quizz.findOne({
            _id: id,
        })

        if (!quizz) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const subjectData = await Subject.findOne({ _id: subject._id })

        if (!subjectData) {
            return res.status(400).json({
                message: 'ไม่พบรายวิชา!',
            })
        }

        slug = slug.trim().replace(/\s+/g, '-').toLowerCase()

        const quizzBySlug = await Quizz.findOne({
            slug,
        })

        if (quizzBySlug && quizzBySlug._id != id) {
            return res.status(400).json({
                message: 'รหัสสอบนี้มีอยู่แล้ว!',
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
            const fileName = `${subjectData.slug}_${slug}_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            if (quizz.image) {
                const oldImage = quizz.image.replace(
                    `${process.env.API_URL}/uploads/`,
                    ''
                )
                if (fs.existsSync(`./uploads/${oldImage}`)) {
                    fs.unlinkSync(`./uploads/${oldImage}`)
                }
            }

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        quizz.subject = subject
        quizz.title = title
        quizz.description = description
        quizz.slug = slug
        if (start_at) {
            quizz.start_at = new Date(start_at)
        }
        if (end_at) {
            quizz.end_at = new Date(end_at)
        }
        quizz.is_active = is_active
        if (imageUrl) {
            quizz.image = imageUrl
        }

        const data = await quizz.save()

        return res.status(200).json({
            data,
            message: 'อัพเดทห้องสอบสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.deleteQuizz = async(req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสห้องสอบไม่ถูกต้อง!',
            })
        }

        const quizz = await Quizz.findOne({
            _id: id,
        })

        if (!quizz) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        if (quizz.image) {
            const oldImage = quizz.image.replace(
                `${process.env.API_URL}/uploads/`,
                ''
            )
            if (fs.existsSync(`./uploads/${oldImage}`)) {
                fs.unlinkSync(`./uploads/${oldImage}`)
            }
        }

        const data = await quizz.remove()

        return res.status(200).json({
            data,
            message: 'ลบห้องสอบสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.joinQuizz = async(req, res) => {
    try {
        const { quizzId } = req.params

        if (!quizzId) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        if (!quizzId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสห้องสอบไม่ถูกต้อง!',
            })
        }

        const quizz = await Quizz.findOne({
            _id: quizzId,
        }).populate('subject')

        if (!quizz) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        if (!quizz.is_active) {
            return res.status(400).json({
                message: 'ห้องสอบไม่เปิดให้ทำการสอบ!',
            })
        }

        const now = new Date()
        const start = new Date(quizz.start_at)
        if (now < quizz.start_at) {
            return res.status(400).json({
                message: 'ห้องสอบจะเปิดให้ทำ ' + start.toLocaleString(),
            })
        }

        if (now > quizz.end_at) {
            return res.status(400).json({
                message: 'ห้องสอบนี้ปิดแล้ว!',
            })
        }

        const questions = await Question.find({
            quizz: quizz._id,
        })

        if (!questions || questions.length <= 0) {
            return res.status(400).json({
                message: 'ห้องสอบยังไม่สมบูรณ์ กรุณารออาจารย์แก้ไข!',
            })
        }

        const user = await User.findOne({ _id: req.user._id })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const currentQuizzSlug = user.currentQuizz ?
            user.currentQuizz.split('/')[1] :
            null
        if (currentQuizzSlug) {
            const currentQuizz = await Quizz.findOne({
                slug: currentQuizzSlug,
            })

            const resultOfCurrentQuizz = await Result.findOne({
                user: user._id,
                quizz: currentQuizz._id,
            })

            if (currentQuizz && resultOfCurrentQuizz) {
                if (
                    resultOfCurrentQuizz.state === 'submitted' ||
                    resultOfCurrentQuizz.state === 'late'
                ) {
                    user.currentQuizz = null
                    await user.save()
                }

                if (
                    resultOfCurrentQuizz.state === 'pending' &&
                    currentQuizz._id !== quizz._id
                ) {
                    return res.status(400).json({
                        message: 'ไม่สามารถทำข้อสอบพร้อมกันได้ กรุณาทำข้อสอบเก่าให้เสร็จก่อน!',
                    })
                }
            }
        }

        user.currentQuizz = `${quizz.subject.slug}/${quizz.slug}`
        await user.save()

        const userQuizz = await Result.findOne({
            user: user._id,
            quizz: quizz._id,
            group: null,
        })

        if (userQuizz && userQuizz.state === 'submitted') {
            return res.status(400).json({
                message: 'คุณได้ส่งคำตอบแล้ว! ไม่สามารถส่งคำตอบซ้ำได้',
            })
        }

        if (userQuizz) {
            return res.status(200).json({
                message: 'คุณเข้าห้องสอบแล้ว!',
            })
        }

        const newUserQuizz = new Result({
            user: user._id,
            quizz: quizz._id,
            joined_at: new Date(),
        })

        const data = await newUserQuizz.save()

        return res.status(200).json({
            data,
            message: 'เข้าห้องสอบสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getPendingQuizz = async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id })

        if (!user) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const pendingQuizz = await Result.find({
            user: user._id,
            state: 'pending',
        }).populate('quizz')

        return res.status(200).json({ pendingQuizz })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: 'Server Error!',
        })
    }
}

exports.getQuizzState = async(req, res) => {
    try {
        const { quizzId } = req.params

        if (!quizzId) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizz
        if (!quizzId.match(/^[0-9a-fA-F]{24}$/)) {
            quizz = await Quizz.findOne({
                slug: quizzId,
            }).populate('subject')
        } else {
            quizz = await Quizz.findOne({
                _id: quizzId,
            }).populate('subject')
        }

        if (!quizz) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        if (!quizz.is_active) {
            return res.status(400).json({
                message: 'ห้องสอบไม่เปิดให้ทำการสอบ!',
            })
        }

        const now = new Date()
        const start = new Date(quizz.start_at)
        if (now < quizz.start_at) {
            return res.status(400).json({
                message: 'ห้องสอบจะเปิดให้ทำ ' + start.toLocaleString(),
            })
        }

        if (now > quizz.end_at) {
            return res.status(400).json({
                message: 'ห้องสอบนี้ปิดแล้ว!',
            })
        }

        const user = await User.findOne({ _id: req.user._id })
        if (!user) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const userQuizz = await Result.findOne({
            user: user._id,
            quizz: quizz._id,
            group: null,
        })

        if (
            userQuizz &&
            (userQuizz.state === 'submitted' || userQuizz.state === 'lated')
        ) {
            return res.status(400).json({
                message: 'คุณได้ส่งคำตอบแล้ว! ไม่สามารถเข้าทำข้อสอบได้',
            })
        }

        if (!userQuizz) {
            return res.status(200).json({
                started: false,
            })
        }

        return res.status(200).json({
            started: true,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.submitQuizz = async(req, res) => {
    try {
        const { quizzId } = req.params
        const { answers } = req.body

        if (!answers) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        if (!quizzId) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizz
        if (!quizzId.match(/^[0-9a-fA-F]{24}$/)) {
            quizz = await Quizz.findOne({
                slug: quizzId,
            })
        } else {
            quizz = await Quizz.findOne({
                _id: quizzId,
            })
        }

        if (!quizz) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        if (!quizz.is_active) {
            return res.status(400).json({
                message: 'ห้องสอบไม่เปิดให้ทำการสอบ!',
            })
        }

        const user = await User.findOne({ _id: req.user._id })
        if (!user) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        if (user.currentQuizz && user.currentQuizz.split('/')[1] !== quizz.slug) {
            return res.status(400).json({
                message: 'ไม่สามารถทำข้อสอบพร้อมกันได้ กรุณาทำข้อสอบเก่าให้เสร็จก่อน!',
            })
        }

        const now = new Date()
        const start = new Date(quizz.start_at)
        if (now < quizz.start_at) {
            return res.status(400).json({
                message: 'ห้องสอบจะเปิดให้ทำ ' + start.toLocaleString(),
            })
        }

        const userQuizz = await Result.findOne({
            user: user._id,
            quizz: quizz._id,
            group: null,
        })

        if (!userQuizz) {
            return res.status(400).json({
                message: 'คุณยังไม่ได้เริ่มทำการสอบ!',
            })
        }

        if (
            (userQuizz && userQuizz.state === 'submitted') ||
            userQuizz.state === 'lated'
        ) {
            return res.status(400).json({
                message: 'คุณได้ทำการสอบแล้ว!',
            })
        }

        const userAnswers = []
        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i]
            userAnswers.push({
                question: answer.questionId,
                answer: answer.choiceId,
            })
        }
        userQuizz.submitted_at = now
        userQuizz.answers = userAnswers
        userQuizz.score = 0
        const lated = new Date(now.getTime() + 20 * 1000)
        userQuizz.state = quizz.end_at > lated ? 'lated' : 'submitted'

        const questions = await Question.find({
            quizz: quizz._id,
        }).populate('quizz')

        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i]
            const question = questions.find(
                (question) => question._id.toString() === answer.questionId
            )
            if (!question) {
                continue
            }

            const choice = question.choices.find(
                (choice) => choice._id.toString() === answer.choiceId
            )
            if (!choice) {
                continue
            }

            if (choice.isCorrect) {
                userQuizz.score += 1
            }
        }

        await userQuizz.save()

        user.currentQuizz = null
        await user.save()

        return res.status(200).json({
            lated: quizz.end_at > lated,
            message: 'ส่งคำตอบเรียบร้อย!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}