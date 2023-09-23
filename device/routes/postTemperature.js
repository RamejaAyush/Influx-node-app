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

const generateTemperature = () => {
  return Math.floor(Math.random() * (50 - 27 + 1) + 27)
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
  console.log('*** Inside /post/temperature ***')
  const temperatureValue = generateTemperature()
  const writeData = await writeToDB(temperatureValue)

  console.log('*** API ENDS ***')
  if (!writeData.success) return writeData
  return res.status(200).json(writeData)
})

module.exports = router
