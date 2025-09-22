import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface ApiResponse {
  message: string;
  timestamp: string;
  success: boolean;
  data: {
    frontend: string;
    backend: string;
  };
}

function App() {
  const [count, setCount] = useState(0)
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApiCall = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Use relative path for production, fallback to localhost for development
      const apiUrl = import.meta.env.PROD 
        ? '/api/test' 
        : 'http://localhost:3001/api/test'
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      setApiData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      
      {/* API Test Section */}
      <div className="card">
        <h2>API Connection Test</h2>
        <button onClick={testApiCall} disabled={loading}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {apiData && (
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <h3>✅ API Response:</h3>
            <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {/* Original Counter Section */}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
