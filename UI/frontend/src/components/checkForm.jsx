import '../styles/checkForm.scss'
import axios from 'axios'
import { useState } from 'react'
import PropTypes from 'prop-types'
import Logo from '../assets/logo.svg'

const CheckForm = ({ port, setPort, token, setToken, setIsConnected }) => {
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (port.length === 0 || token.length === 0) {
      setError('All fields are required!')
      return
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/ping?port=${port}`
      )

      if (response.data.success) {
        setIsConnected(true)
        setError(null)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    }
  }

  return (
    <div className="form">
      <div className="form-container">
        <div className="header">
          <img src={Logo} alt="" />
          <h1>IGBT Health App</h1>
        </div>
        <form>
          <div className="port">
            <label htmlFor="Port">Influx Port</label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="http://localhost:8086?"
            />
            <div className="sugest">
              <div
                onClick={() => setPort('http://localhost:8086')}
                className="sg-box"
              >
                <p>localhost?</p>
              </div>
              <div
                onClick={() => setPort('http://162.2.2.10:8086')}
                className="sg-box"
              >
                <p>Static IP?</p>
              </div>
            </div>
          </div>
          <div className="token">
            <label htmlFor="token">Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              placeholder="token"
            />
          </div>
          <div className="error-container">{error && <p>{error}</p>}</div>
          <input
            required
            className="submit-btn"
            type="button"
            value="Connect Now"
            onClick={handleSubmit}
          />
        </form>
      </div>
    </div>
  )
}

CheckForm.propTypes = {
  setIsConnected: PropTypes.func.isRequired,
  port: PropTypes.func.isRequired,
  setPort: PropTypes.func.isRequired,
  token: PropTypes.func.isRequired,
  setToken: PropTypes.func.isRequired,
}

export default CheckForm
