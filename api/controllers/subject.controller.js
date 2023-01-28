const fs = require('fs')
const Subject = require('../models/subject.model')

exports.createSubject = async(req, res) => {
    try {
        let { title, description, slug, image } = req.body

        if (!title || !slug) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        slug = slug.trim().replace(/\s+/g, '-').toLowerCase()

        const subject = await Subject.findOne({ slug })
        if (subject) {
            return res.status(400).json({
                message: 'มีรหัสวิชานี้อยู่แล้ว!',
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
            const fileName = `${slug}_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        const newSubject = new Subject({
            title,
            description,
            slug,
            image: imageUrl,
        })

        if (!imageUrl) {
            delete newSubject.image
        }

        const data = await newSubject.save()

        return res.status(200).json({
            data,
            message: 'สร้างรายวิชาสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.getSubjects = async(req, res) => {
    try {
        let { search } = req.query

        let data
        if (!search) {
            data = await Subject.find({})
        } else {
            search = search.trim()
            data = await Subject.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search, $options: 'i' } },
                ],
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

exports.getSubject = async(req, res) => {
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
            data = await Subject.findOne({
                _id: findReq,
            })
        } else {
            const slug = find.split('_')[1]
            data = await Subject.findOne({
                slug,
            })
        }

        if (!data) {
            return res.status(400).json({
                message: 'ไม่พบรายวิชา!',
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

exports.updateSubject = async(req, res) => {
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

        let { title, description, slug, image } = req.body

        if (!title || !slug) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            })
        }

        slug = slug.trim().replace(/\s+/g, '-').toLowerCase()

        const subject = await Subject.findOne({
            _id: id,
        })

        if (!subject) {
            return res.status(400).json({
                message: 'ไม่พบรายวิชา!',
            })
        }

        const subjectBySlug = await Subject.findOne({
            slug,
        })

        if (subjectBySlug && subjectBySlug._id != id) {
            return res.status(400).json({
                message: 'มีรหัสวิชานี้อยู่แล้ว!',
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
            const fileName = `${slug}_${Date.now()}.${
        image.split(';')[0].split('/')[1]
      }`
            const path = `./uploads/${fileName}`
            fs.writeFileSync(path, base64Data, {
                encoding: 'base64',
            })

            if (subject.image) {
                const oldImage = subject.image.replace(
                    `${process.env.API_URL}/uploads/`,
                    ''
                )
                if (fs.existsSync(`./uploads/${oldImage}`)) {
                    fs.unlinkSync(`./uploads/${oldImage}`)
                }
            }

            imageUrl = `${process.env.API_URL}/uploads/${fileName}`
        }

        subject.title = title
        subject.description = description
        subject.slug = slug
        if (imageUrl) {
            subject.image = imageUrl
        }

        const data = await subject.save()

        return res.status(200).json({
            data,
            message: 'แก้ไขรายวิชาสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}

exports.deleteSubject = async(req, res) => {
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

        const subject = await Subject.findOne({
            _id: id,
        })

        if (!subject) {
            return res.status(400).json({
                message: 'ไม่พบรายวิชา!',
            })
        }

        if (subject.image) {
            const oldImage = subject.image.replace(
                `${process.env.API_URL}/uploads/`,
                ''
            )
            if (fs.existsSync(`./uploads/${oldImage}`)) {
                fs.unlinkSync(`./uploads/${oldImage}`)
            }
        }

        const data = await subject.remove()

        return res.status(200).json({
            data,
            message: 'ลบรายวิชาสำเร็จ!',
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: 'เกิดข้อผิดพลาด!',
        })
    }
}