const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'devteach',
    password: 'Mysql123',
    // host: 'localhost',
    host: 'db4free.net',
    database: 'bdg_mysql',
    port: 3306
})

module.exports = conn