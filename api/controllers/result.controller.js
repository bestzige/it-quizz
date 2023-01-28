const Quizz = require('../models/quizz.model')
const Group = require('../models/group.model')
const User = require('../models/user.model')
const Result = require('../models/result.model')
const Question = require('../models/question.model')
const Excel = require('exceljs')
const jwt = require('jsonwebtoken')

exports.getAllResultByQuizz = async(req, res) => {
    try {
        let { quizz } = req.params

        if (!quizz) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizzData
        if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
            quizzData = await Quizz.findOne({ slug: quizz })
        } else {
            quizzData = await Quizz.findOne({
                _id: quizz,
            })
        }

        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const question = await Question.find({
            quizz: quizzData._id,
        })

        const data = await Result.find({
            quizz: quizzData._id,
            group: null,
        }).populate(['user', 'quizz'])

        if (data.length == 0) {
            return res.status(200).json({
                data: [],
            })
        }

        let results = []
        data.forEach((result) => {
            const answersXd = result.answers.map((answer) => {
                const questionData = question.find(
                    (q) =>
                    q._id.toString() == (answer.question && answer.question.toString())
                )

                if (questionData) {
                    const choice = questionData.choices.find(
                        (c) => c._id.toString() == answer.answer.toString()
                    )

                    const correctChoice = questionData.choices.find((c) => c.isCorrect)

                    return {
                        question: questionData.title,
                        choice: choice.title,
                        correctChoice: correctChoice.title,
                        correct: choice.isCorrect,
                    }
                } else {
                    return {
                        question: 'ไม่พบคำถาม',
                        choice: 'ไม่พบคำตอบ',
                        correctChoice: 'ไม่พบคำตอบที่ถูกต้อง',
                        correct: false,
                    }
                }
            })

            const scoreXd = answersXd.filter((a) => a.correct).length

            results.push({
                ...result._doc,
                answers: answersXd,
                score: scoreXd,
                allQuestion: question.length,
            })
        })

        return res.status(200).json({
            data: results,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getUserResultByQUizz = async(req, res) => {
    try {
        let { quizz, user } = req.params

        if (!quizz) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizzData
        if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
            quizzData = await Quizz.findOne({
                slug: quizz,
            })
        } else {
            quizzData = await Quizz.findOne({
                _id: quizz,
            })
        }

        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        if (!user.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const userData = await User.findOne({
            _id: user,
        })

        if (!userData) {
            return res.status(400).json({
                message: 'ไม่พบผู้ใช้งาน!',
            })
        }

        const result = await Result.findOne({
            quizz: quizzData._id,
            user: user,
        })

        if (!result) {
            return res.status(400).json({
                message: 'ไม่พบผลการสอบ!',
            })
        }

        const question = await Question.find({
            quizz: quizzData._id,
        })

        const answers = result.answers.map((answer) => {
            const questionData = question.find(
                (q) => q._id.toString() == answer.question.toString()
            )

            const choice = questionData.choices.find(
                (c) => c._id.toString() == answer.answer.toString()
            )

            const correctChoice = questionData.choices.find((c) => c.isCorrect)

            return {
                question: questionData.title,
                choice: choice.title,
                correctChoice: correctChoice.title,
                correct: choice.isCorrect,
            }
        })

        const score = answers.filter((a) => a.correct).length

        return res.status(200).json({
            score,
            answers,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

// exports.clearAllUserExam = async(req, res) => {
//     try {
//         const { quizz } = req.params

//         const { title, description } = req.body
//         if (!title) {
//             return res.status(400).json({
//                 message: 'กรุณากรอกชื่อกลุ่ม!',
//             })
//         }

//         if (!quizz) {
//             return res.status(400).json({
//                 message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
//             })
//         }

//         let quizzData
//         if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
//             quizzData = await Quizz.findOne({
//                 slug: quizz,
//             })
//         } else {
//             quizzData = await Quizz.findOne({
//                 _id: quizz,
//             })
//         }

//         if (!quizzData) {
//             return res.status(400).json({
//                 message: 'ไม่พบห้องสอบ!',
//             })
//         }

//         const results = await Result.find({
//             quizz: quizzData._id,
//             group: null,
//         })

//         if (results.length == 0) {
//             return res.status(400).json({
//                 message: 'ไม่พบผลการสอบ!',
//             })
//         }

//         // const group = new Group({
//         //     quizz: quizzData._id,
//         //     title,
//         //     description,
//         // })

//         // results.forEach((result) => {
//         //     result.group = group._id
//         // })

//         // await group.save()

//         result.forEach((result) => {
//             result.remove()
//         })

//         await Promise.all(results.map((result) => result.save()))

//         return res.status(200).json({
//             message: 'เคลียผู้สอบทั้งหมดเรียบร้อยแล้ว!',
//         })
//     } catch (error) {
//         console.log(error)
//         return res.status(400).json({
//             message: 'เกิดข้อผิดพลาด!',
//         })
//     }
// }

exports.clearUser = async(req, res) => {
    try {
        const { quizz } = req.params

        const { title, description } = req.body
        if (!title) {
            return res.status(400).json({
                message: 'กรุณากรอกชื่อกลุ่ม!',
            })
        }

        if (!quizz) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizzData
        if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
            quizzData = await Quizz.findOne({
                slug: quizz,
            })
        } else {
            quizzData = await Quizz.findOne({
                _id: quizz,
            })
        }

        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const results = await Result.find({
            quizz: quizzData._id,
            group: null,
        }).populate('user')

        if (results.length == 0) {
            return res.status(400).json({
                message: 'ไม่พบผลการสอบ!',
            })
        }

        const group = new Group({
            quizz: quizzData._id,
            title,
            description,
        })

        await group.save()

        results.forEach((result) => {
            result.group = group._id
        })

        await Promise.all(results.map((result) => result.save()))

        return res.status(200).json({
            group: group._id,
            message: 'เคลียผู้สอบเรียบร้อยแล้ว!',
        })
    } catch (error) {
        console.log(error)
        return
    }
}

exports.exportUserData = async(req, res) => {
    try {
        const { quizz, group, token } = req.params

        if (!quizz || !group || !token) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
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

        if (!user.isAdmin) {
            return res.status(401).json({
                message: 'คุณไม่มีสิทธิ์ใช้งาน!',
            })
        }

        if (!group.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        let quizzData
        if (!quizz.match(/^[0-9a-fA-F]{24}$/)) {
            quizzData = await Quizz.findOne({
                slug: quizz,
            })
        } else {
            quizzData = await Quizz.findOne({
                _id: quizz,
            })
        }

        if (!quizzData) {
            return res.status(400).json({
                message: 'ไม่พบห้องสอบ!',
            })
        }

        const results = await Result.find({
            quizz: quizzData._id,
            group,
        }).populate('user')

        if (results.length == 0) {
            return res.status(400).json({
                message: 'ไม่พบผลการสอบ!',
            })
        }

        const question = await Question.find({
            quizz: quizzData._id,
        })

        const data = results.map((result) => {
            const answers = result.answers.map((answer) => {
                const questionData = question.find(
                    (q) => q._id.toString() == answer.question.toString()
                )

                const choice = questionData.choices.find(
                    (c) => c._id.toString() == answer.answer.toString()
                )

                const correctChoice = questionData.choices.find((c) => c.isCorrect)

                return {
                    question: questionData.title,
                    choice: choice.title,
                    correctChoice: correctChoice.title,
                    correct: choice.isCorrect,
                }
            })

            const score = answers.filter((a) => a.correct).length

            return {
                user: result.user,
                score,
                answers,
            }
        })

        const workbook = new Excel.Workbook()
        const worksheet = workbook.addWorksheet(quizzData.title)

        worksheet.columns = [
            { header: 'รหัส', key: 'username', width: 30 },
            { header: 'ชื่อ', key: 'nickname', width: 30 },
            { header: 'คะแนน', key: 'score', width: 10 },
            { header: 'คำถาม/คำตอบ', key: 'questionAndAnswer', width: 100 },
        ]

        data.forEach((d) => {
            worksheet.addRow({
                username: d.user.username,
                nickname: d.user.nickname,
                score: d.score,
                questionAndAnswer: d.answers.map((a) => {
                    return `${a.question} : ${a.choice} (${
            a.correct ? 'ถูก' : 'ผิด'
          } คำตอบที่ถูกคือ ${a.correctChoice})`
                }),
            })
        })

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        const now = new Date()

        const groupData = await Group.findOne({ _id: group })
        if (!groupData) {
            return res.status(400).json({
                message: 'ไม่พบกลุ่ม!',
            })
        }

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' +
            quizzData.title +
            '_' +
            'Group_' +
            groupData.title +
            '_' +
            now.getTime() +
            '.xlsx'
        )

        return workbook.xlsx.write(res).then(function() {
            res.status(200).end()
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}