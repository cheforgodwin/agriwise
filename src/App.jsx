import Home from './pages/public/Home.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Dashboard from './pages/user/Dashboard.jsx'

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/login') return <Login />
  if (path === '/register' || path === '/signup') return <Register />
  if (path === '/dashboard') return <Dashboard />

  return <Home />
}
