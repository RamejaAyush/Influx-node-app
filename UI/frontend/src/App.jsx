import './styles/app.scss'
import { useState } from 'react'
import Chart from './components/chart'
import CheckForm from './components/checkForm'

function App() {
  const [port, setPort] = useState('')
  const [token, setToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="app">
      <nav>
        <div className="logo">
          <h1>SIEMENS</h1>
        </div>
      </nav>
      {isConnected ? (
        <Chart />
      ) : (
        <CheckForm
          port={port}
          setPort={setPort}
          token={token}
          setToken={setToken}
          setIsConnected={setIsConnected}
        />
      )}
    </div>
  )
}

export default App
