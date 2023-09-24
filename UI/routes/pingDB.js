require('dotenv').config()
const express = require('express')
const router = express.Router({ mergeParams: true })
const { InfluxDB } = require('@influxdata/influxdb-client')
const { PingAPI } = require('@influxdata/influxdb-client-apis')

const influxConfigs = {
  org: process.env.INFLUX_ORG,
  bucket: process.env.INFLUX_TEMP_BUCKET,
}

router.post('/', async (req, res) => {
  console.log('--- inside /api/ping ---')
  const { port, token } = req.query

  try {
    const influxDB = new InfluxDB({
      url: port,
      token,
    })
    const pingAPI = new PingAPI(influxDB)

    pingAPI
      .getPing()
      .then(() => {
        const message = 'Ping Success'

        console.log(message)
        return res
          .status(200)
          .json({ success: true, requestPort: port, message })
      })
      .catch((err) => {
        return res.status(400).json({ success: false, message: err })
      })
  } catch (err) {
    console.error(err)

    return res.status(400).json({
      success: false,
      requestPort: port,
      message: err,
    })
  }
})

module.exports = router
