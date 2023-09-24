require('dotenv').config()
const express = require('express')
const router = express.Router({ mergeParams: true })
const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const influxConfigs = {
  url: process.env.INFLUX_PORT,
  org: process.env.INFLUX_ORG,
  token: process.env.INFLUX_TOKEN,
  bucket: process.env.INFLUX_TEMP_BUCKET,
}

router.get('/', async (req, res) => {
  console.log('*** Inside /post/rainflow ***')

  const queryApi = new InfluxDB({
    url: influxConfigs.url,
    token: influxConfigs.token,
  }).getQueryApi(influxConfigs.org)

  const query = `from(bucket: "IGBT") 
  |> range(start: -1h) 
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> filter(fn: (r) => r["device"] == "S120")
  |> limit(n: 140)
  `

  try {
    const data = await queryApi.collectRows(query)
    if (!data || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Query Processed, but got 0 rows' })
    }

    const temperatures = data.map((temp) => temp._value)
    const labels = data.map((entry) => {
      const date = new Date(entry._time)
      const hour = date.getUTCHours().toString().padStart(2, '0')
      const minute = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hour}:${minute}`
    })

    return res
      .status(200)
      .json({ totalRows: data.length, temperatures, labels, data })
  } catch (err) {
    console.error(err)

    return res.status(400).json({ message: err })
  }
})

module.exports = router
