const nodemailer = require('nodemailer')
// config
const efig = require('./config')

let transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        type: 'OAuth2',
        user: 'rochafi.teach@gmail.com',
        clientId: efig.clientId,
        clientSecret: efig.clientSecret,
        refreshToken: efig.refreshToken
    }
})

let mail = {
    from: 'Rochafi Teach <rochafi.teach@gmail.com>',
    to: 'rochafi.dev@gmail.com',
    subject: 'Selamat Datang',
    html:`<h1>Hello Gengs</h1>`
}

transporter.sendMail(mail, (err, result) => {
    if(err) return console.log(err)

    console.log('Email berhasil di kirim')
})