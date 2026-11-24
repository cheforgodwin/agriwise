import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../services/authService.js'
import './Dashboard.css'

const roleDetails = {
  farmer: {
    label: 'Farmer',
    welcome: 'Your farm journey starts here.',
    actions: [
      { icon: 'leaf', title: 'Crop care', detail: 'Find practical guidance for healthier crops.', href: '#crop-care' },
      { icon: 'sun', title: 'Local weather', detail: 'Keep weather planning on your radar.', href: '#weather' },
      { icon: 'market', title: 'Find a market', detail: 'Explore produce and market opportunities.', href: '#market' },
    ],
  },
  buyer: {
    label: 'Buyer',
    welcome: 'Discover what is growing near you.',
    actions: [
      { icon: 'market', title: 'Explore produce', detail: 'Browse crops and seasonal opportunities.', href: '#market' },
      { icon: 'pin', title: 'Your area', detail: 'Your location helps shape local discoveries.', href: '#your-area' },
      { icon: 'leaf', title: 'Growing insights', detail: 'Learn more about the crops you source.', href: '#crop-care' },
    ],
  },
  officer: {
    label: 'Agricultural officer',
    welcome: 'Helpful insights for the work you do.',
    actions: [
      { icon: 'leaf', title: 'Crop care', detail: 'Explore practical crop guidance.', href: '#crop-care' },
      { icon: 'pin', title: 'Your area', detail: 'Keep local context close at hand.', href: '#your-area' },
      { icon: 'market', title: 'Market overview', detail: 'Explore produce and market opportunities.', href: '#market' },
    ],
  },
}

function readUser() {
  const savedUser = localStorage.getItem('agriwiseUser')
  if (!savedUser) return null

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem('agriwiseUser')
    localStorage.removeItem('agriwiseToken')
    return null
  }
}

function DashboardIcon({ name }) {
  const paths = {
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-7 8-16Z" /><path d="M4 21c2-5 6-8 12-11" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    market: <><path d="M3 10h18l-2-6H5l-2 6Zm2 0v10h14V10m-9 10v-6h4v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.leaf}
    </svg>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(readUser)
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const role = roleDetails[user?.role] || roleDetails.farmer
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there'
  const location = [user?.location?.quarter, user?.location?.region].filter(Boolean).join(', ')

  useEffect(() => {
    const token = localStorage.getItem('agriwiseToken')
    let active = true

    if (!token) {
      window.location.replace('/login')
      return () => {
        active = false
      }
    }

    setIsLoading(true)
    setProfileError('')

    getCurrentUser(token)
      .then((profile) => {
        if (!active) return
        setUser(profile)
        localStorage.setItem('agriwiseUser', JSON.stringify(profile))
      })
      .catch((error) => {
        if (!active) return

        if (error.status === 401) {
          localStorage.removeItem('agriwiseToken')
          localStorage.removeItem('agriwiseUser')
          window.location.replace('/login')
          return
        }

        setProfileError(error.message || 'Unable to load your profile from the backend.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [retryCount])

  function signOut() {
    localStorage.removeItem('agriwiseToken')
    localStorage.removeItem('agriwiseUser')
    window.location.assign('/')
  }

  if (!localStorage.getItem('agriwiseToken')) return null

  if (isLoading && !user) {
    return (
      <main className="dashboard-load-state" role="status">
        <p className="dashboard-eyebrow">YOUR AGRIWISE SPACE</p>
        <h1>Loading your account…</h1>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="dashboard-load-state">
        <p className="dashboard-eyebrow">ACCOUNT UNAVAILABLE</p>
        <h1>We couldn’t load your profile.</h1>
        <p>{profileError}</p>
        <button type="button" className="dashboard-primary-link" onClick={() => setRetryCount((count) => count + 1)}>
          Try again
        </button>
        <a className="dashboard-load-login" href="/login">Return to login</a>
      </main>
    )
  }

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/" aria-label="Agriwise home">
          <img src="/logo.svg" alt="Agriwise" />
        </a>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a className="is-current" href="#overview">Overview</a>
          <a href="#your-tools">Your tools</a>
          <a href="#getting-started">Getting started</a>
        </nav>
        <div className="dashboard-account">
          <span className="account-avatar" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
          <span className="account-name">{firstName}</span>
          <button type="button" className="sign-out-button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="dashboard-main" id="overview">
        {profileError && (
          <div className="dashboard-api-error" role="alert">
            <p>{profileError} Showing your last saved profile for now.</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
          </div>
        )}
        <div className="dashboard-greeting">
          <div>
            <p className="dashboard-eyebrow">YOUR AGRIWISE SPACE</p>
            <h1>Good to see you, {firstName}.</h1>
            <p>{role.welcome}</p>
          </div>
          <span className="dashboard-role">{role.label}</span>
        </div>

        <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
          <div className="dashboard-hero-copy">
            <p className="dashboard-eyebrow">GROW WITH CONFIDENCE</p>
            <h2 id="dashboard-hero-title">A little more insight.<br />A lot more possibility.</h2>
            <p>Start with the tools and local information that support your growing journey.</p>
            <a className="dashboard-primary-link" href="#your-tools">Explore your tools <span aria-hidden="true">→</span></a>
          </div>
          <img src="/images/farm-hero.svg" alt="" className="dashboard-hero-art" />
          <span className="dashboard-hero-tag"><span /> Your next step starts here</span>
        </section>

        <section className="dashboard-summary" aria-label="Your account overview">
          <article className="summary-card">
            <span className="summary-icon"><DashboardIcon name="pin" /></span>
            <div><p>Your area</p><strong>{location || 'Add your location'}</strong></div>
          </article>
          <article className="summary-card">
            <span className="summary-icon"><DashboardIcon name="leaf" /></span>
            <div><p>Account type</p><strong>{role.label}</strong></div>
          </article>
          <article className="summary-card">
            <span className="summary-icon summary-icon--verified">✓</span>
            <div><p>Phone status</p><strong>{user.isPhoneVerified ? 'Verified' : 'Not verified'}</strong></div>
          </article>
        </section>

        <section className="dashboard-tools" id="your-tools">
          <div className="dashboard-section-heading">
            <div>
              <p className="dashboard-eyebrow">MADE FOR YOUR JOURNEY</p>
              <h2>Your tools</h2>
            </div>
            <p>Useful starting points, picked for your {role.label.toLowerCase()} account.</p>
          </div>
          <div className="dashboard-tool-grid">
            {role.actions.map((action) => (
              <a className="dashboard-tool-card" href={action.href} key={action.title}>
                <span className="tool-icon"><DashboardIcon name={action.icon} /></span>
                <span className="tool-card-arrow" aria-hidden="true">↗</span>
                <h3>{action.title}</h3>
                <p>{action.detail}</p>
                <span className="tool-card-link">Take a look <span aria-hidden="true">→</span></span>
              </a>
            ))}
          </div>
        </section>

        <section className="dashboard-next-steps" id="getting-started">
          <div className="next-steps-copy">
            <p className="dashboard-eyebrow">GETTING STARTED</p>
            <h2>Make this space yours.</h2>
            <p>Your profile is ready. Explore the sections below to find practical information for your work and your area.</p>
            <a href="#your-area">View your area <span aria-hidden="true">→</span></a>
          </div>
          <div className="next-steps-list">
            <a href="#crop-care" id="crop-care"><span>01</span><div><strong>Explore crop care</strong><small>Browse practical growing guidance</small></div><b aria-hidden="true">↗</b></a>
            <a href="#weather" id="weather"><span>02</span><div><strong>Plan with local context</strong><small>Keep an eye on weather information</small></div><b aria-hidden="true">↗</b></a>
            <a href="#market" id="market"><span>03</span><div><strong>Discover produce markets</strong><small>See what growers and buyers can explore</small></div><b aria-hidden="true">↗</b></a>
            <span className="dashboard-area-anchor" id="your-area" />
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <a href="/" aria-label="Agriwise home"><img src="/logo.svg" alt="Agriwise" /></a>
        <span>Growing stronger, together.</span>
        <a href="/#about">About Agriwise</a>
      </footer>
    </div>
  )
}
