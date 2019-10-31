const express = require('express')

const app = express()
const port = 2019

app.use(express.json())

app.listen(port, () => {
    console.log(`Running at ${port}`)
})