import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import HomePage from './components/HomePage'

const APP_VERSION = '1.0.0'

export default function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer
        style={{
          textAlign: 'center',
          padding: '1rem 0',
          background: 'var(--bg-color)',
          color: 'var(--text-color)',
        }}
      >
        Version: {APP_VERSION}
      </footer>
    </div>
  )
}