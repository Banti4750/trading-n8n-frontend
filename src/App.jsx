import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Workflow from './component/Workflow'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/create-workflow' element={<Workflow />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
