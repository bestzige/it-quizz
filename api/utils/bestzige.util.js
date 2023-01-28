const { default: axios } = require('axios')
const jwt = require('jsonwebtoken')

exports.getRedirectUrl = () => {
    return `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${process.env.API_URL}%2Fauth%2Fcallback&client_id=${process.env.GOOGLE_CLIENT_ID}&access_type=offline&response_type=code&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email`
}

exports.userAuth = async(code) => {
    try {
        const { data } = await axios({
            url: 'https://oauth2.googleapis.com/token',
            method: 'post',
            data: {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.API_URL}/auth/callback`,
                grant_type: 'authorization_code',
                code,
            },
        })
        return data
    } catch (error) {
        console.error(error)
        return false
    }
}

exports.getUserInfo = async(accessToken, idToken) => {
    const { data } = await axios({
        url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`,
        method: 'get',
        headers: {
            authorization: 'Bearer ' + idToken,
        },
    })
    data.email = data.email.toLowerCase()
    data.avatar = data.picture
    data.nickname = data.name
    data.username = data.email.split('@')[0]
    return data
}

exports.generateToken = (user) => {
    const token = jwt.sign({
            id: user._id,
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    )
    return token
}

exports.generateUUID = () => {
    let d = new Date().getTime()
    if (
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
    ) {
        d += performance.now() //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}