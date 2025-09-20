import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import HomePage from './pages/home/HomePage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <HomePage/>
    </>
  )
}

export default App
