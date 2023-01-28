const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const { readdirSync } = require('fs')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }).then(
    () => {
        console.info(`[Success] : Connected to the database`)
    },
    (error) => {
        console.error(`[Error] : ${error}`)
        process.exit()
    }
)

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
)
app.use(express.json({ limit: '50mb' }))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

readdirSync('./routes').map((r) => app.use('', require(`./routes/${r}`)))

const port = process.env.API_PORT || 5000
app.listen(port, () => {
    console.info(`[Success] : Server is running on port ${port}`)
})