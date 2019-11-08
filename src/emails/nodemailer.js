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

let sendVerification = (data) => {
    // data = {username, email, name, password}
    let mail = {
        from: 'Alvin <alvin@purwadhika.com>',
        to: data.email,
        subject: 'Selamat Datang',
        html:`<h1>Hello, ${data.name}</h1>
            <a href='http://localhost:2019/verification/${data.username}'>Klik untuk verifikasi</a>`,
        attachments:[
            {
                filename: 'invoice.pdf',
                path: `${uploadDirectory}/'invoice.pdf`,
                contentType: 'application/pdf'
            }
        ]
    }
    
    transporter.sendMail(mail, (err, result) => {
        if(err) return console.log(err)
    
        console.log('Email berhasil di kirim')
    })
}

module.exports = sendVerification