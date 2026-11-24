import { useState } from 'react'
import { login, saveAuthSession } from '../../services/authService.js'
import './Auth.css'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await login(phone.trim(), pin)
      saveAuthSession(session)
      window.location.assign('/dashboard')
    } catch (requestError) {
      setError(requestError.message || 'Unable to log in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/" aria-label="Agriwise home">
        <img src="/logo.svg" alt="Agriwise" />
      </a>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="auth-eyebrow">Welcome back</p>
        <h1 id="login-title">Log in to Agriwise</h1>
        <p className="auth-intro">Access your account with your phone number and PIN.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Phone number
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+237 6XX XXX XXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <label>
            PIN
            <input
              type="password"
              name="pin"
              inputMode="numeric"
              autoComplete="current-password"
              minLength="4"
              maxLength="6"
              pattern="[0-9]{4,6}"
              title="Enter your 4 to 6 digit PIN"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              required
            />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New to Agriwise? <a href="/register">Create an account</a>
        </p>
        <a className="auth-home-link" href="/">Back to home</a>
      </section>
    </main>
  )
}