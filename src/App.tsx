import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Apply from '@/pages/Apply'
import Status from '@/pages/Status'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/status" element={<Status />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
