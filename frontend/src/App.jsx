import { useState } from 'react'
import './App.css'

const categories = [
  { icon: '🚗', label: 'Cars' },
  { icon: '🏍️', label: 'Bikes' },
  { icon: '🛺', label: 'Auto Rickshaws' },
  { icon: '🚐', label: 'Vans' },
  { icon: '🚚', label: 'Trucks' },
  { icon: '🚌', label: 'Buses' },
  { icon: '🚜', label: 'Commercial' },
  { icon: '🚘', label: 'More Vehicles' },
]

const stats = [
  { value: '25k+', label: 'Verified listings' },
  { value: '4.9/5', label: 'Seller rating' },
  { value: '120+', label: 'Cities covered' },
  { value: '24/7', label: 'Buyer support' },
]

const featuredListings = [
  {
    title: '2022 Toyota Camry',
    type: 'Sedan',
    price: '₹24,500',
    meta: 'Hybrid • 28k km • Automatic',
    tag: 'Certified',
  },
  {
    title: '2021 Royal Enfield Classic 350',
    type: 'Bike',
    price: '₹1,85,000',
    meta: 'Petrol • 14k km • Excellent',
    tag: 'Popular',
  },
  {
    title: '2023 Mahindra Bolero',
    type: 'SUV',
    price: '₹9,80,000',
    meta: 'Diesel • 22k km • Verified',
    tag: 'New Arrival',
  },
]

const steps = [
  { number: '01', title: 'List your vehicle', text: 'Post your vehicle details in minutes and reach serious buyers.' },
  { number: '02', title: 'Get matched instantly', text: 'AutoHub connects you with verified buyers and sellers in your area.' },
  { number: '03', title: 'Close the deal', text: 'Negotiate safely, verify documents, and complete your transaction with confidence.' },
]

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [formMode, setFormMode] = useState('login')
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    mobile: '',
    role: 'buyer',
    district: '',
  })

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    if (formMode === 'signup') {
      if (!formData.name || !formData.password || !formData.mobile || !formData.district) {
        return
      }
    } else if (!formData.name || !formData.password) {
      return
    }

    setIsLoggedIn(true)
    setIsLoginOpen(false)
    setFormData({
      name: '',
      password: '',
      mobile: '',
      role: 'buyer',
      district: '',
    })
  }

  return (
    <div className="app-shell">
      {isLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
          <div className="login-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-kicker">Welcome to AutoHub</p>
                <h3>{formMode === 'login' ? 'Login to continue' : 'Create your account'}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsLoginOpen(false)} aria-label="Close login modal">
                ×
              </button>
            </div>

            <div className="mode-switch">
              <button
                type="button"
                className={formMode === 'login' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setFormMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={formMode === 'signup' ? 'mode-btn active' : 'mode-btn'}
                onClick={() => setFormMode('signup')}
              >
                Sign up
              </button>
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit}>
              {formMode === 'signup' && (
                <>
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                    />
                  </label>

                  <label>
                    <span>Mobile number</span>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                    />
                  </label>

                  <label>
                    <span>I am a</span>
                    <select name="role" value={formData.role} onChange={handleInputChange}>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </label>
                </>
              )}

              <label>
                <span>District</span>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Enter your district"
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
              </label>

              <button type="submit" className="primary-btn auth-submit">
                {formMode === 'login' ? 'Login' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <p className="brand-name">AutoHub</p>
            <span className="brand-tag">Buy. Sell. Drive.</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#marketplace">Marketplace</a>
          <a href="#how-it-works">How it works</a>
          <a href="#featured">Featured</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="user-badge">
              <span className="user-avatar">A</span>
              <span>Ash</span>
            </div>
          ) : (
            <button type="button" className="ghost-btn" onClick={() => setIsLoginOpen(true)}>
              Login
            </button>
          )}
          <button type="button" className="primary-btn">Sell Now</button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="badge">Trusted marketplace for every vehicle</span>
            <h1>Buy and sell vehicles with confidence.</h1>
            <p>
              Discover verified cars, bikes, commercial vehicles, and more through AutoHub —
              the smarter way to move inventory from seller to buyer.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-btn large">Explore vehicles</button>
              <button type="button" className="secondary-btn large">List a vehicle</button>
            </div>

            <div className="trust-row">
              <div>
                <strong>10k+</strong>
                <span>Happy buyers</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Deal success</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Vehicle showcase">
            <div className="hero-card main-card">
              <div className="card-top">
                <span className="dot green" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <div className="vehicle-illustration">
                <div className="vehicle-body">
                  <span className="window" />
                  <span className="wheel left" />
                  <span className="wheel right" />
                </div>
              </div>
              <div className="vehicle-info">
                <div>
                  <p>Featured Deal</p>
                  <strong>2024 Hyundai Creta</strong>
                </div>
                <span>₹17.9L</span>
              </div>
            </div>

            <div className="floating-badge">
              <span>Avg. response</span>
              <strong>12 min</strong>
            </div>
          </div>
        </section>

        <section className="stats-section" aria-label="Marketplace performance">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="categories-section" id="marketplace">
          <div className="section-heading">
            <span className="eyebrow">Vehicle categories</span>
            <h2>Find the right vehicle for every need.</h2>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <div className="category-card" key={category.label}>
                <span className="category-icon">{category.icon}</span>
                <span>{category.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="featured-section" id="featured">
          <div className="section-heading split">
            <div>
              <span className="eyebrow">Featured inventory</span>
              <h2>Popular vehicles buyers are checking now.</h2>
            </div>
            <button type="button" className="secondary-btn">View all listings</button>
          </div>

          <div className="listing-grid">
            {featuredListings.map((listing) => (
              <article className="listing-card" key={listing.title}>
                <div className="listing-image">
                  <span className="listing-badge">{listing.tag}</span>
                </div>
                <div className="listing-body">
                  <div className="listing-header">
                    <div>
                      <p className="listing-type">{listing.type}</p>
                      <h3>{listing.title}</h3>
                    </div>
                    <strong>{listing.price}</strong>
                  </div>
                  <p className="listing-meta">{listing.meta}</p>
                  <button type="button" className="primary-btn small">Details</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="process-section" id="how-it-works">
          <div className="section-heading center">
            <span className="eyebrow">How it works</span>
            <h2>Simple steps from listing to delivery.</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer" id="pricing">
        <div>
          <p className="brand-name footer-brand">AutoHub</p>
          <span className="brand-tag">Seller → AutoHub → Buyer</span>
        </div>
        <button type="button" className="primary-btn">Start selling</button>
      </footer>
    </div>
  )
}

export default App
