require('dotenv').config()
const { InfluxDB, HttpError } = require('@influxdata/influxdb-client')
const { OrgsAPI, BucketsAPI } = require('@influxdata/influxdb-client-apis')

const influxConfigs = {
  url: process.env.INFLUX_PORT,
  org: process.env.INFLUX_ORG,
  token: process.env.INFLUX_TOKEN,
  bucket: process.env.INFLUX_TEMP_BUCKET,
}

const checkOrgDetails = async (client) => {
  const orgAPI = new OrgsAPI(client)
  const organizations = await orgAPI.getOrgs({ org: influxConfigs.org })

  if (!organizations || !organizations.orgs || !organizations.orgs.length) {
    const message = `No organization named "${org}" found!`

    console.error(message)
    return {
      success: false,
      message,
    }
  }

  const orgID = organizations.orgs[0].id
  const message = `Using Org ${influxConfigs.org}, identified by ${orgID}`

  console.log(message)
  return {
    success: true,
    orgID,
    message,
  }
}

const checkBucket = async (client, orgID) => {
  const bucketAPI = new BucketsAPI(client)

  try {
    const buckets = await bucketAPI.getBuckets({
      orgID,
      name: influxConfigs.bucket,
    })

    if (buckets && buckets.buckets && buckets.buckets.length) {
      const bucketID = buckets.buckets[0].id
      const message = `Bucket named "${influxConfigs.bucket}" exists`

      console.log(message)
      return {
        success: true,
        bucketID,
        message,
      }
    }
  } catch (e) {
    if (e instanceof HttpError && e.statusCode == 404) {
      console.log(`*** Create Bucket "${influxConfigs.bucket}" ***`)

      const bucket = await bucketAPI.postBuckets({
        body: { orgID, name: influxConfigs.bucket },
      })

      const message = JSON.stringify(
        bucket,
        (key, value) => (key === 'links' ? undefined : value),
        2
      )

      return {
        success: true,
        message,
      }
    } else {
      return {
        success: false,
        message: e,
      }
    }
  }
}

const ensureBucketExists = async (req, res, next) => {
  const influxDB = new InfluxDB({
    url: influxConfigs.url,
    token: influxConfigs.token,
  })

  const validateOrgDetails = await checkOrgDetails(influxDB)
  if (!validateOrgDetails.success)
    return res.status(400).json(validateOrgDetails)

  const validateBucket = await checkBucket(influxDB, validateOrgDetails.orgID)
  if (!validateBucket.success) return res.status(400).json(validateBucket)

  next()
}

module.exports = ensureBucketExists
