import { useEffect, useState } from 'react'
import './App.css'
import { MainScene } from './components/main_scene'

function App() {
  const [loading, setLoading] = useState<boolean>(true)

  const loadApp = () => new Promise((resolve, reject) => {
    // Load in any data crucial to app
    resolve (true)
  })

  useEffect(() => {
    loadApp().then(() => {
      setLoading(false)
    })
  }, [])

  return (
    <div className="App">
      <MainScene />  
    </div>
  )
}

export default App
