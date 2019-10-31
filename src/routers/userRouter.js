const conn = require('../connection/index')
const router = require('express').Router()

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

    let sql = `INSERT INTO users SET ?`
    let data = req.body // {username, name, email, password}

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})














module.exports = router