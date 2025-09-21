import { BrowserRouter } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import HomePage from "./pages/home/HomePage"

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Body */}
        <main className="flex-1 mx-auto w-full max-w-7xl p-4">
          <HomePage />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
