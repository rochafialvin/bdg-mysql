const conn = require('../connection/index')
const router = require('express').Router()
const valid = require('validator')
const bcryptjs = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sendVerification = require('../emails/nodemailer')
// __dirname = C:\Users\rochafi\Desktop\bdg-mysql\src\routers
const uploadDirectory = path.join(__dirname, '/../../public/uploads')

// {
//     "fieldname": "avatar",
//     "originalname": "doggo-1.docx",
//     "encoding": "7bit",
//     "mimetype": "image/jpeg",
//     "destination": "D:\\Project\\BE-ExpressMysql\\public\\uploads",
//     "filename": "1572793683443avatar.jpg",
//     "path": "D:\\Project\\BE-ExpressMysql\\public\\uploads\\1572793683443images.jpg",
//     "size": 41880
// }

// Menentukan dimana foto akan disimpan, dan bagaimana foto tersebut di beri nama
const _storage = multer.diskStorage({
    // Menentukan folder penyimpanan foto
    destination: function(req, file, cb){
        cb(null, uploadDirectory)
    },
    // Menentukan pola nama file
    filename: function(req, file, cb){
        cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: _storage,
    limits: {
        fileSize : 1000000 // Byte, max 1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
        }

        cb(undefined, true)
    }
})

// POST AVATAR
// pattern baru
    // avatar-username.jpg
// hapus foto jika user not found
    // fs.unlinkSync
router.post('/avatar/:username', upload.single('avatar'),(req, res) => {
    console.log(req.body)
    // Mencari user berdasarkan username
    const sql = `SELECT * FROM users WHERE username = '${req.params.username}'`
    // Jika user ditemukan, akan simpan nama foto ke dalam kolom avatar dari user tersebut
    const sql2 = `UPDATE users SET avatar = '${req.file.filename}'
                    WHERE username = '${req.params.username}'`

    // Cari user berdasarkan username
    conn.query(sql, (err, result) => {
        if(err) return res.send({err : err.message})
        // user = {id, username, email, password, avatar}
        let user = result[0]
        // Jika user tidak di temukan
        if(!user) return res.send({err: "User not found"})

        // Simpan nama foto yang baru di upload
        conn.query(sql2, (err, result) => {
            if(err) return res.send({err: err.message})
            
            res.send({filename: req.file.filename})
        })
    
    })
}, (err, req, res, next) => {
    if(err) return res.send({err : err.message})
})

// ACCESS IMAGE
router.get('/avatar/:namaFile', (req, res) => {
    // Nama File
    let namaFile = req.params.namaFile

    // Letak folder
    let letakFolder = {
        root: uploadDirectory
    }

    // Mengirim file sebagai response
    res.sendFile(namaFile, letakFolder, function(err){
        if(err) return res.send({err: err.message})

    })
})

// GET ALL USERS
router.get('/users', (req, res) => {
    let sql = `SELECT * FROM users`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})


// CREATE USER V1
router.post('/usersv1', (req, res) => {
    let {username, name, email, password} = req.body

    let sql = `INSERT INTO users(username, name, email, password)
                VALUES ('${username}', '${name}', '${email}', '${password}')`

    conn.query(sql, (err, result) => {
        // Jika terdapat error
        if(err) return res.send(err)

        res.send(result)

    })
})

// CREATE USER V2
router.post('/users', (req, res) => {

    let sql = `INSERT INTO users SET ?` // tanda tanya akan diisi oleh data
    let sql2 = `SELECT * FROM users`
    let data = req.body // {username, name, email, password}

    // Cek formar email
    if(!valid.isEmail(data.email)) return res.send({error: 'Format email is not valid'})
    // Hash password
    data.password = bcryptjs.hashSync(data.password, 8)

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        // Kirim email verifikasi
        sendVerification(data)

        conn.query(sql2, (err, result) => {
            if(err) return res.send(err)

            res.send(result)
        })
    })
})

// UPDATE USER
// bug ketika update password, tolong di benerin
router.patch('/users/:userid', (req, res) => {
    let sql = `UPDATE users SET ? WHERE id = ?`
    let data = [req.body, req.params.userid]

    conn.query(sql, data, (err, result) => {
        if(err) return res.end(err)

        res.send(result)
    })
})

// DELETE USER
router.delete('/users/:userid', (req, res) => {
    let sql = `DELETE FROM users WHERE id = ${req.params.userid}`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

// LOGIN USER
router.post('/users/login', (req, res) => {
    let {email, password} = req.body

    let sql = `SELECT * FROM users WHERE email = '${email}'`

    conn.query(sql, async (err, result) => {
        if(err) return res.send(err)
        // Jika user tidak ditemukan
        if(result.length == 0) return res.send({error: "User not found"})
        // User dipindahkan ke variabel, agar mudah dalam penggunaan
        let user = result[0]
        // Bandingkan password inputan dg yang ada di database, return true or false
        let hash = await bcryptjs.compare(password, user.password)
        // Jika hash bernilai false, kirim object error
        if(!hash) return res.send({error: "Wrong password"})
        // Apakah user sudah melakukan verifikasi
        if(!user.verified) return res.send({error: "Please verification your email"})
        // Kirim user sebagai respon
        res.send(user)

    })
})

// VERIFICATION
// Browser secara default akan mengakses alamat internert dengan method GET
// Maka dari itu kita menggunakan method get pada link yang di kriim melalui email
router.get('/verification/:username', (req, res) => {
    let sql = `UPDATE users SET verified = true WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send('Verifikasi berhasil')
    })
})

// READ PROFILE
router.get('/users/profile/:username', (req, res) => {
    let sql = `SELECT * FROM users WHERE username = '${req.params.username}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send({err: err.message})

        let user = result[0]

        if(!user) return res.send({err: "User not found"})

        res.send({
            ...user,
            avatar: `http://localhost:2019/avatar/${user.avatar}`
        })
        
    })
})



















module.exports = router

/*
    upload satu gambar
        upload.single()
    
    upload lebih dari satu gambar
        upload.array()
*/