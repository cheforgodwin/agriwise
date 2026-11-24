import { useEffect, useState } from 'react'
import { getRegions, register, saveAuthSession, verifyRegistration } from '../../services/authService.js'
import './Auth.css'

const initialForm = {
  fullName: '',
  phone: '',
  pin: '',
  role: 'farmer',
  region: '',
  quarter: '',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [regions, setRegions] = useState([])
  const [otp, setOtp] = useState('')
  const [isVerificationStep, setIsVerificationStep] = useState(false)
  const [isLoadingRegions, setIsLoadingRegions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    getRegions()
      .then(({ regions: availableRegions }) => {
        if (active) setRegions(availableRegions)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Unable to load regions.')
      })
      .finally(() => {
        if (active) setIsLoadingRegions(false)
      })

    return () => {
      active = false
    }
  }, [])

  function updateForm(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleRegister(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const result = await register({ ...form, phone: form.phone.trim() })
      setIsVerificationStep(true)
      setNotice(result.message || 'A verification code has been sent to your phone.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerify(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const session = await verifyRegistration(form.phone.trim(), otp)
      saveAuthSession(session)
      window.location.assign('/dashboard')
    } catch (requestError) {
      setError(requestError.message || 'Unable to verify your phone. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-brand" href="/" aria-label="Agriwise home">
        <img src="/logo.svg" alt="Agriwise" />
      </a>
      <section className="auth-card auth-card--register" aria-labelledby="register-title">
        <p className="auth-eyebrow">{isVerificationStep ? 'One last step' : 'Join Agriwise'}</p>
        <h1 id="register-title">{isVerificationStep ? 'Verify your phone' : 'Create your account'}</h1>
        <p className="auth-intro">
          {isVerificationStep
            ? `Enter the 6-digit code sent to ${form.phone}.`
            : 'Create an account to get started with Agriwise.'}
        </p>

        {isVerificationStep ? (
          <form className="auth-form" onSubmit={handleVerify}>
            <label>
              Verification code
              <input
                type="text"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength="6"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
              />
            </label>
            {notice && <p className="auth-notice" role="status">{notice}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying…' : 'Verify phone'}
            </button>
            <button
              className="auth-back-button"
              type="button"
              onClick={() => {
                setIsVerificationStep(false)
                setError('')
                setNotice('')
              }}
            >
              Back to registration
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              Full name
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                value={form.fullName}
                onChange={updateForm}
                required
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+237 6XX XXX XXX"
                value={form.phone}
                onChange={updateForm}
                required
              />
            </label>
            <label>
              PIN (4–6 digits)
              <input
                type="password"
                name="pin"
                inputMode="numeric"
                autoComplete="new-password"
                minLength="4"
                maxLength="6"
                pattern="[0-9]{4,6}"
                title="Choose a 4 to 6 digit PIN"
                value={form.pin}
                onChange={updateForm}
                required
              />
            </label>
            <label>
              I am a
              <select name="role" value={form.role} onChange={updateForm} required>
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="officer">Agricultural officer</option>
              </select>
            </label>
            <label>
              Region
              <select
                name="region"
                value={form.region}
                onChange={updateForm}
                disabled={isLoadingRegions || regions.length === 0}
                required
              >
                <option value="">{isLoadingRegions ? 'Loading regions…' : 'Select a region'}</option>
                {regions.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </label>
            <label>
              Quarter / locality
              <input
                type="text"
                name="quarter"
                autoComplete="address-level3"
                minLength="2"
                maxLength="80"
                value={form.quarter}
                onChange={updateForm}
                required
              />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting || isLoadingRegions || regions.length === 0}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        {!isVerificationStep && (
          <p className="auth-switch">
            Already have an account? <a href="/login">Log in</a>
          </p>
        )}
        <a className="auth-home-link" href="/">Back to home</a>
      </section>
    </main>
  )
}