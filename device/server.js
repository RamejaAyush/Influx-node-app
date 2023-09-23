require('dotenv').config()
const path = require('path')
const cors = require('cors')
const express = require('express')

const postTemperature = require('./routes/postTemperature')
const ensureBucketExists = require('./middleware/checkBucket')

const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.static(path.join(__dirname, 'frontend/dist')))

app.use('/post/temperature', ensureBucketExists, postTemperature)

app.get('*', (req, res) => {
  console.log(`Inside: ${path.join(__dirname, 'frontend/dist', 'index.html')}`)
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`S120 device is running on http://localhost:${PORT}`)
})
