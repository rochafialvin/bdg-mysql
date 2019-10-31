const conn = require('../connection/index')
const router = require('express').Router()

// GET ALL TASKS

// GET ALL OWN TASKS

// GET TASK BY ID

// CREATE TASK
router.post('/tasks', (req, res) => {

    let sql = `INSERT INTO tasks SET ?`
    let data = req.body
    let sql2 = `SELECT * FROM tasks`

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err.sqlMessage)

        conn.query(sql2, (err, result) => {
            if(err) return res.send(err.sqlMessage)

            res.send(result)
        })
    })
})

// UPDATE TASK

// DELETE TASK


module.exports = router