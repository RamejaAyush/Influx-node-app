require('dotenv').config()
const express = require('express')
const { spawn } = require('child_process')
const router = express.Router({ mergeParams: true })
const { InfluxDB, Point } = require('@influxdata/influxdb-client')

const influxConfigs = {
  url: process.env.INFLUX_PORT,
  org: process.env.INFLUX_ORG,
  token: process.env.INFLUX_TOKEN,
  bucket: process.env.INFLUX_TEMP_BUCKET,
}

const writeToDB = async (temperatureValue) => {
  const writeAPI = new InfluxDB({
    url: influxConfigs.url,
    token: influxConfigs.token,
  }).getWriteApi(influxConfigs.org, influxConfigs.bucket, 'ms')

  const point = new Point('temperature')
    .tag('device', 'S120')
    .floatField('value', temperatureValue)

  writeAPI.writePoint(point)

  try {
    await writeAPI.close()

    const message = `${temperatureValue} is written to DB`
    return {
      success: true,
      message,
      temperature: temperatureValue,
    }
  } catch (err) {
    return {
      success: false,
      message: err,
    }
  }
}

router.post('/', async (req, res) => {
  console.log('*** Inside /post/rainflow ***')

  const queryApi = new InfluxDB({
    url: influxConfigs.url,
    token: influxConfigs.token,
  }).getQueryApi(influxConfigs.org)

  const query = `from(bucket: "IGBT") 
  |> range(start: -5s) 
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> filter(fn: (r) => r["device"] == "S120")
  `

  try {
    const data = await queryApi.collectRows(query)

    if (!data || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Query Processed, but got 0 rows' })
    }

    const temperatures = data.map((temp) => temp._value)
    const python = spawn('python', ['script/script.py', temperatures])

    let scriptOutput = ''

    python.stdout.on('data', (data) => {
      scriptOutput += data.toString()
    })

    python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
    })

    python.on('close', (code) => {
      const message = `Python script finished with code ${code}`

      console.log(message)
      res
        .status(200)
        .json({ message, scriptOutput, totalRows: data.length, temperatures })
    })

    // return res.status(200).json({ totalRows: data.length, temperatures, data })
  } catch (err) {
    console.error(err)

    return res.status(400).json({ message: err })
  }
})

module.exports = router
