import { useState } from 'react'
import './Home.css'

const crops = [
  { name: 'Tomatoes', category: 'Vegetables', availability: 'In season', color: 'tomato' },
  { name: 'Maize', category: 'Grains', availability: 'Popular', color: 'maize' },
  { name: 'Avocados', category: 'Fruits', availability: 'Fresh harvest', color: 'avocado' },
]

const features = [
  {
    number: '01',
    title: 'Know your crops',
    description: 'Get practical crop care guidance and spot potential issues earlier.',
    icon: 'leaf',
  },
  {
    number: '02',
    title: 'Plan around weather',
    description: 'Make informed decisions with useful local weather insights.',
    icon: 'sun',
  },
  {
    number: '03',
    title: 'Find your market',
    description: 'Discover market trends and connect with people who want your produce.',
    icon: 'market',
  },
]

function FeatureIcon({ name }) {
  if (name === 'sun') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </svg>
    )
  }

  if (name === 'market') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10h18l-2-6H5l-2 6Zm2 0v10h14V10m-9 10v-6h4v6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-7 8-16Z" />
      <path d="M4 21c2-5 6-8 12-11" />
    </svg>
  )
}

function CropCard({ crop }) {
  return (
    <article className="crop-card">
      <div className={`crop-art crop-art--${crop.color}`} aria-hidden="true">
        <span>{crop.name === 'Tomatoes' ? 'T' : crop.name === 'Maize' ? 'M' : 'A'}</span>
      </div>
      <div className="crop-card__body">
        <div>
          <p className="crop-card__category">{crop.category}</p>
          <h3>{crop.name}</h3>
        </div>
        <span className="crop-status"><span />{crop.availability}</span>
      </div>
    </article>
  )
}

export default function Home() {
  const [search, setSearch] = useState('')
  const visibleCrops = crops.filter((crop) =>
    `${crop.name} ${crop.category}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Agriwise home">
          <img src="/logo.svg" alt="" />
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#solutions">Solutions</a>
          <a href="#markets">Markets</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <a className="header-login" href="/login">Log in</a>
          <a className="button button--outline header-cta" href="/register">Sign up <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main>
        <section className="hero page-width" id="home">
          <div className="hero-copy">
            <p className="eyebrow"><span /> A smarter way to grow</p>
            <h1>Good things grow<br />with <span>the right insight.</span></h1>
            <p className="hero-description">
              From the first seed to the final sale, find the guidance and connections
              that help your farm thrive.
            </p>
            <div className="hero-actions">
              <a className="button button--primary" href="#solutions">Explore Agriwise <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#about">See how it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-note"><span className="note-avatars" aria-hidden="true"><i>F</i><i>G</i><i>A</i></span><span>Made for every step of your growing journey</span></div>
          </div>
          <div className="hero-visual">
            <div className="visual-label"><span className="live-dot" /> YOUR FARM, IN FOCUS</div>
            <img src="/images/farm-hero.svg" alt="Illustration of green fields and a growing crop under the sun" />
            <div className="insight-card">
              <div className="insight-icon"><FeatureIcon name="leaf" /></div>
              <div><p>Growing well</p><strong>Better days start here.</strong></div>
              <span className="insight-arrow" aria-hidden="true">↗</span>
            </div>
            <span className="visual-spark visual-spark--one" aria-hidden="true">✳</span>
            <span className="visual-spark visual-spark--two" aria-hidden="true">✳</span>
          </div>
        </section>

        <section className="trust-strip" aria-label="Agriwise services">
          <div className="page-width trust-strip__inner">
            <p>Everything you need to grow with confidence</p>
            <div><span>01</span> Crop insights</div>
            <div><span>02</span> Weather updates</div>
            <div><span>03</span> Market connections</div>
          </div>
        </section>

        <section className="solutions-section page-width" id="solutions">
          <div className="section-heading">
            <div><p className="eyebrow">A little more certainty</p><h2>Built around your<br />work in the field.</h2></div>
            <p>Farming has enough unknowns. Agriwise brings helpful tools and information together, so your next decision feels a little clearer.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-card__top"><span>{feature.number}</span><div className="feature-icon"><FeatureIcon name={feature.icon} /></div></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#markets" aria-label={`Learn more about ${feature.title}`}>Learn more <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="market-section" id="markets">
          <div className="page-width market-section__inner">
            <div className="market-copy">
              <p className="eyebrow"><span /> From field to market</p>
              <h2>There’s a place<br />for what you grow.</h2>
              <p>Explore what’s in season and take the next step toward finding the right market for your harvest.</p>
              <a className="button button--primary" href="#produce">Explore produce <span aria-hidden="true">↗</span></a>
              <p className="market-disclaimer">Example produce categories. Availability varies by location and season.</p>
            </div>
            <div className="produce-panel" id="produce">
              <div className="produce-panel__heading">
                <div><p className="eyebrow">Fresh opportunities</p><h3>Explore produce</h3></div>
                <label className="search-field">
                  <span className="sr-only">Search produce</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
                  <input type="search" placeholder="Find a crop" value={search} onChange={(event) => setSearch(event.target.value)} />
                </label>
              </div>
              <div className="crop-grid">
                {visibleCrops.map((crop) => <CropCard key={crop.name} crop={crop} />)}
                {visibleCrops.length === 0 && <p className="empty-search">No crops match “{search}”. Try another search.</p>}
              </div>
              <div className="produce-panel__footer"><span>Explore by crop</span><a href="#get-started">Browse all <span aria-hidden="true">↗</span></a></div>
            </div>
          </div>
        </section>

        <section className="closing-section page-width" id="get-started">
          <div className="closing-mark" aria-hidden="true"><FeatureIcon name="leaf" /></div>
          <div><p className="eyebrow">Your next season starts now</p><h2>Let’s grow something good.</h2></div>
          <a className="button button--light" href="mailto:hello@agriwise.com">Get in touch <span aria-hidden="true">↗</span></a>
        </section>
      </main>

      <footer className="site-footer" id="about">
        <a className="brand" href="#home" aria-label="Agriwise home"><img src="/logo.svg" alt="" /></a>
        <p>Growing stronger, together.</p>
        <span>© {new Date().getFullYear()} Agriwise</span>
      </footer>
    </div>
  )
}