const fs = require('fs')
const Question = require('../models/question.model')

exports.addChoice = async(req, res) => {
    try {
        const { questionId } = req.params
        const { title, description, image, isCorrect } = req.body

        if (!questionId) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: 'รหัสคำถามไม่ถูกต้อง!',
            })
        }

        const question = await Question.findOne({
            _id: questionId,
        }).populate('quizz')

        if (!question) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        if (!title) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
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
            const fileName = `${question._id}_choice_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        const choice = {
            title,
            description,
            image: imageUrl,
            isCorrect,
        }

        if (!imageUrl) {
            delete choice.image
        }

        question.choices.push(choice)

        const data = await question.save()

        return res.status(200).json({
            data: data.choices,
            message: 'เพิ่มคำตอบเรียบร้อยแล้ว!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getChoice = async(req, res) => {
    try {
        const { questionId, choiceId } = req.params

        if (!questionId && !choiceId) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!questionId.match(/^[0-9a-fA-F]{24}$/) ||
            !choiceId.match(/^[0-9a-fA-F]{24}$/)
        ) {
            return res.status(400).json({
                message: 'รหัสคำถามไม่ถูกต้อง!',
            })
        }

        const question = await Question.findOne({
            _id: questionId,
        })

        if (!question) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        const choice = question.choices.id(choiceId)

        if (!choice) {
            return res.status(400).json({
                message: 'ไม่พบคำตอบ!',
            })
        }

        return res.status(200).json({
            data: choice,
            message: 'ดึงข้อมูลคำตอบเรียบร้อยแล้ว!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.updateChoice = async(req, res) => {
    try {
        const { questionId, choiceId } = req.params
        const { title, description, image, isCorrect } = req.body

        if (!questionId && !choiceId) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!questionId.match(/^[0-9a-fA-F]{24}$/) ||
            !choiceId.match(/^[0-9a-fA-F]{24}$/)
        ) {
            return res.status(400).json({
                message: 'รหัสคำถามไม่ถูกต้อง!',
            })
        }

        const question = await Question.findOne({
            _id: questionId,
        })

        if (!question) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        if (!title) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        // set all isCorrect choices to false
        question.choices.forEach((choice) => {
            choice.isCorrect = false
        })

        const choice = question.choices.id(choiceId)

        if (!choice) {
            return res.status(400).json({
                message: 'ไม่พบคำตอบ!',
            })
        }

        let imageUrl = choice.image
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
            const fileName = `${question._id}_choice_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            if (choice.image) {
                const oldImage = choice.image.replace(
                    `${process.env.API_URL}/uploads/`,
                    ''
                )
                if (fs.existsSync(`./uploads/${oldImage}`)) {
                    fs.unlinkSync(`./uploads/${oldImage}`)
                }
            }

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        choice.title = title
        choice.description = description
        choice.isCorrect = isCorrect

        if (imageUrl) {
            choice.image = imageUrl
        }

        const data = await question.save()

        return res.status(200).json({
            data: data.choices,
            message: 'แก้ไขคำตอบเรียบร้อยแล้ว!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.deleteChoice = async(req, res) => {
    try {
        const { questionId, choiceId } = req.params

        if (!questionId && !choiceId) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสคำถาม!',
            })
        }

        if (!questionId.match(/^[0-9a-fA-F]{24}$/) ||
            !choiceId.match(/^[0-9a-fA-F]{24}$/)
        ) {
            return res.status(400).json({
                message: 'รหัสคำถามไม่ถูกต้อง!',
            })
        }

        const question = await Question.findOne({
            _id: questionId,
        })

        if (!question) {
            return res.status(400).json({
                message: 'ไม่พบคำถาม!',
            })
        }

        const choice = question.choices.id(choiceId)

        if (!choice) {
            return res.status(400).json({
                message: 'ไม่พบคำตอบ!',
            })
        }

        if (choice.image) {
            const oldImage = choice.image.replace(
                `${process.env.API_URL}/uploads/`,
                ''
            )
            if (fs.existsSync(`./uploads/${oldImage}`)) {
                fs.unlinkSync(`./uploads/${oldImage}`)
            }
        }

        choice.remove()

        const data = await question.save()

        return res.status(200).json({
            data: data.choices,
            message: 'ลบคำตอบเรียบร้อยแล้ว!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}