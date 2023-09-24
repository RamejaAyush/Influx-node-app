import axios from 'axios'
import '../styles/temperature.scss'
import { useState, useEffect } from 'react'

const TemperatureComponent = () => {
  const [error, setError] = useState(null)
  const [duration, setDuration] = useState(1000)
  const [intervalId, setIntervalId] = useState(null)
  const [temperatureValues, setTemperatureValues] = useState([])

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  const startApiCalls = () => {
    if (duration < 100 || duration > 10000) {
      setError('Wooohh! Stick between 100ms and 10000ms, Bro')
      return
    }

    setError(null)

    const id = setInterval(async () => {
      try {
        const response = await axios.post(
          'http://localhost:8082/post/temperature'
        )
        setTemperatureValues((prevTemps) => [
          response.data.temperature,
          ...prevTemps,
        ])
      } catch (error) {
        console.error(`Something's not right: ${error}`)
      }
    }, duration)

    setIntervalId(id)
  }

  const stopApiCalls = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  return (
    <div className="temperature">
      <div className="form">
        {error && (
          <div className="error" style={{ color: 'red' }}>
            {error}
          </div>
        )}
        <h1>IGBT Health App</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Duration (ms):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          {!intervalId ? (
            <button type="button" onClick={startApiCalls}>
              Start
            </button>
          ) : (
            <button type="button" onClick={stopApiCalls}>
              Stop
            </button>
          )}
        </form>
      </div>
      <div className="values">
        <h2>Temperature Values:</h2>
        <div className="val-container">
          {temperatureValues.map((temp, index) => (
            <div
              key={index}
              className="val"
              style={{
                border: '1px solid black',
                margin: '5px',
                padding: '10px',
              }}
            >
              {temp}°
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TemperatureComponent
