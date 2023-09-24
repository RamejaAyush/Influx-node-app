import './styles/app.scss'
import { useState } from 'react'
import Chart from './components/chart'
import CheckForm from './components/checkForm'

function App() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="app">
      <nav>
        <div className="logo">
          <h1>SIEMENS</h1>
        </div>
      </nav>
      {isConnected ? <Chart /> : <CheckForm />}
    </div>
  )
}

export default App
