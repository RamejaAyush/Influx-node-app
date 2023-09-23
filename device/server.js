require('dotenv').config()
const express = require('express')

const postTemperature = require('./routes/postTemperature')
const ensureBucketExists = require('./middleware/checkBucket')

const app = express()
const PORT = process.env.PORT

app.use('/post/temperature', ensureBucketExists, postTemperature)

app.listen(PORT, () => {
  console.log(`S120 device is running on http://localhost:${PORT}`)
})
