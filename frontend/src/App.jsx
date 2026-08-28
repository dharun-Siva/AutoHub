import { BrowserRouter, Navigate, Route, Routes, Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

const categories = [
  { icon: '🚗', label: 'Cars', slug: 'cars' },
  { icon: '🏍️', label: 'Bikes', slug: 'bikes' },
  { icon: '🛺', label: 'Auto Rickshaws', slug: 'auto-rickshaws' },
  { icon: '🚐', label: 'Vans', slug: 'vans' },
  { icon: '🚚', label: 'Trucks', slug: 'trucks' },
  { icon: '🚌', label: 'Buses', slug: 'buses' },
  { icon: '🚜', label: 'Commercial', slug: 'commercial' },
  { icon: '🚘', label: 'More Vehicles', slug: 'more-vehicles' },
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

const vehicleCatalog = {
  cars: [],
  bikes: [],
  'auto-rickshaws': [],
  vans: [],
  trucks: [],
  buses: [],
  commercial: [],
  'more-vehicles': [],
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const sectionId = location.hash.replace('#', '')
    const target = document.getElementById(sectionId)

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/vehicles/:category" element={<CategoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppHeader({
  isLoggedIn = false,
  user = null,
  showUserMenu = false,
  onLoginClick = () => {},
  onToggleUserMenu = () => {},
  onLogout = () => {},
}) {
  const displayName = user?.name ? user.name.trim() : 'User'
  const initial = displayName.charAt(0).toUpperCase() || 'U'

  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">DS</div>
        <div>
          <p className="brand-name">AutoHub</p>
          <span className="brand-tag">Buy. Sell. Drive.</span>
        </div>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/#marketplace">Marketplace</Link>
        <Link to="/#how-it-works">How it works</Link>
        <Link to="/#featured">Featured</Link>
        <Link to="/#pricing">Pricing</Link>
      </nav>

      <div className="nav-actions">
        {isLoggedIn ? (
          <div className="user-menu-wrap">
            <button type="button" className="user-badge" onClick={onToggleUserMenu}>
              <span className="user-avatar">{initial}</span>
              <span>{displayName}</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <button type="button" className="dropdown-item" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className="ghost-btn" onClick={onLoginClick}>
            Login
          </button>
        )}
        <button type="button" className="primary-btn">Sell Now</button>
      </div>
    </header>
  )
}

function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [formMode, setFormMode] = useState('login')
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    mobile: '',
    role: 'buyer',
    district: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [missingFields, setMissingFields] = useState([])

  useEffect(() => {
    document.body.style.overflow = isLoginOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isLoginOpen])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.user-menu-wrap')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target

    if (name === 'mobile') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10)

      if (value !== onlyDigits) {
        setErrorMessage('Mobile number should contain only numbers.')
      } else {
        setErrorMessage('')
      }

      setFormData((prev) => ({ ...prev, mobile: onlyDigits }))
      setMissingFields((prev) => prev.filter((field) => field !== name))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    setMissingFields((prev) => prev.filter((field) => field !== name))
    setErrorMessage('')
  }

  const getReadableErrorMessage = (detail) => {
    if (!detail) return 'Something went wrong. Please try again.'

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
      const firstError = detail[0]
      if (firstError && typeof firstError === 'object') {
        const field = Array.isArray(firstError.loc) ? firstError.loc[firstError.loc.length - 1] : null
        const message = firstError.msg || ''

        if (field === 'mobile') {
          if (message.includes('at least')) return 'Mobile number must have at least 10 characters.'
          if (message.toLowerCase().includes('field required')) return 'Please enter your mobile number.'
          return 'Please enter a valid mobile number.'
        }

        if (field === 'password') {
          if (message.includes('at least')) return 'Password must have at least 6 characters.'
          if (message.toLowerCase().includes('field required')) return 'Please enter your password.'
          return 'Please enter a valid password.'
        }

        if (field === 'name') {
          return 'Please enter your name.'
        }

        if (field === 'district') {
          return 'Please enter your district.'
        }

        if (firstError.msg) return firstError.msg
        if (firstError.error) return firstError.error
      }
      return detail.map((item) => (typeof item === 'string' ? item : item?.msg || item?.error || 'Invalid input')).join(', ')
    }

    if (typeof detail === 'object') {
      if (detail.msg) return detail.msg
      if (detail.error) return detail.error
      if (detail.message) return detail.message
    }

    return 'Please check your details and try again.'
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()

    const requiredFields = formMode === 'signup'
      ? ['name', 'mobile', 'district', 'password']
      : ['mobile', 'password']

    const nextMissingFields = requiredFields.filter((field) => !String(formData[field] || '').trim())

    if (nextMissingFields.length > 0) {
      setMissingFields(nextMissingFields)
      setErrorMessage('Please enter all required fields.')
      return
    }

    setMissingFields([])
    setErrorMessage('')

    try {
      const endpoint = formMode === 'signup' ? '/api/signup' : '/api/login'
      const payload = formMode === 'signup'
        ? {
            name: formData.name,
            mobile: formData.mobile,
            password: formData.password,
            role: formData.role,
            district: formData.district,
          }
        : {
            mobile: formData.mobile,
            password: formData.password,
          }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(getReadableErrorMessage(data.detail))
      }

      const userData = data.user || null

      setIsLoggedIn(true)
      setLoggedInUser(userData)
      setShowUserMenu(false)
      setIsLoginOpen(false)
      setFormData({
        name: '',
        password: '',
        mobile: '',
        role: 'buyer',
        district: '',
      })
    } catch (error) {
      const message = error && error.message ? error.message : 'Unable to process your request.'
      setErrorMessage(message)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setLoggedInUser(null)
    setShowUserMenu(false)
    setFormData({
      name: '',
      password: '',
      mobile: '',
      role: 'buyer',
      district: '',
    })
    setErrorMessage('')
  }

  return (
    <div className="app-shell">
      <div className="page-watermark" aria-hidden="true">DS AutoHub</div>

      {isLoginOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginOpen(false)}>
          <div className="login-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="auth-brand-row">
                <div className="mini-brand">DS</div>
                <span>AutoHub</span>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsLoginOpen(false)} aria-label="Close login modal">
                ×
              </button>
            </div>

            <div className="auth-intro">
              <p className="modal-kicker">{formMode === 'login' ? 'Welcome back' : 'Create account'}</p>
              <h3>{formMode === 'login' ? 'Login to continue' : 'Join AutoHub'}</h3>
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit}>
              {errorMessage && <p className="form-error">{errorMessage}</p>}

              {formMode === 'signup' && (
                <>
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={missingFields.includes('name') ? 'Please enter your name' : 'Enter your name'}
                      className={missingFields.includes('name') ? 'invalid-field' : ''}
                    />
                  </label>

                  <label>
                    <span>Mobile number</span>
                    <input
                      type="tel"
                      name="mobile"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder={missingFields.includes('mobile') ? 'Please enter mobile number' : '+91 98765 43210'}
                      className={missingFields.includes('mobile') ? 'invalid-field' : ''}
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

              {formMode === 'login' ? (
                <label>
                  <span>Mobile number</span>
                  <input
                    type="tel"
                    name="mobile"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder={missingFields.includes('mobile') ? 'Please enter mobile number' : 'Enter your mobile number'}
                    className={missingFields.includes('mobile') ? 'invalid-field' : ''}
                  />
                </label>
              ) : (
                <label>
                  <span>District</span>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder={missingFields.includes('district') ? 'Please enter your district' : 'Enter your district'}
                    className={missingFields.includes('district') ? 'invalid-field' : ''}
                  />
                </label>
              )}

              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={missingFields.includes('password') ? 'Please enter your password' : 'Enter your password'}
                  className={missingFields.includes('password') ? 'invalid-field' : ''}
                />
              </label>

              {formMode === 'login' && (
                <button type="button" className="link-btn">
                  Forgot password?
                </button>
              )}

              <button type="submit" className="primary-btn auth-submit">
                {formMode === 'login' ? 'Login' : 'Create account'}
              </button>

              <div className="auth-footer">
                <span>{formMode === 'login' ? 'New user?' : 'Already have an account?'}</span>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setFormMode(formMode === 'login' ? 'signup' : 'login')}
                >
                  {formMode === 'login' ? 'Create account' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AppHeader
        isLoggedIn={isLoggedIn}
        user={loggedInUser}
        showUserMenu={showUserMenu}
        onLoginClick={() => setIsLoginOpen(true)}
        onToggleUserMenu={() => setShowUserMenu((prev) => !prev)}
        onLogout={handleLogout}
      />

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
              <Link to="/vehicles/cars" className="primary-btn large">Explore vehicles</Link>
              <Link to="/vehicles/cars" className="secondary-btn large">List a vehicle</Link>
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

        <section className="categories-section" id="marketplace">
          <div className="section-heading">
            <span className="eyebrow">Vehicle categories</span>
            <h2>Find the right vehicle for every need.</h2>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link to={`/vehicles/${category.slug}`} className="category-card" key={category.label}>
                <span className="category-icon">{category.icon}</span>
                <span>{category.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="featured-section" id="featured">
          <div className="section-heading split">
            <div>
              <span className="eyebrow">Featured inventory</span>
              <h2>Popular vehicles buyers are checking now.</h2>
            </div>
            <Link to="/vehicles/cars" className="secondary-btn">View all listings</Link>
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
                  <Link to="/vehicles/cars" className="primary-btn small">Details</Link>
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
        <Link to="/vehicles/cars" className="primary-btn">Start selling</Link>
      </footer>
    </div>
  )
}

function CategoryPage() {
  const { category } = useParams()
  const categoryInfo = categories.find((item) => item.slug === category) ?? {
    label: 'Vehicles',
    icon: '🚘',
    slug: 'vehicles',
  }
  const items = vehicleCatalog[category] ?? []

  return (
    <div className="category-page-shell">
      <AppHeader />

      <main className="category-page-main">
        <div className="category-page-top">
          <h1>{categoryInfo.label}</h1>
        </div>

        {items.length === 0 ? (
          <div className="empty-category-box">
            <div className="empty-category-icon">{categoryInfo.icon}</div>
            <h2>No {categoryInfo.label.toLowerCase()} listed yet</h2>
            <p>Be the first one to post a {categoryInfo.label.toLowerCase()} in this category.</p>
            <Link to="/" className="primary-btn">Back to home</Link>
          </div>
        ) : (
          <div className="category-list-grid">
            {items.map((item) => (
              <article className="category-list-card" key={item.title}>
                <div className="category-list-thumb">{categoryInfo.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
                <strong>{item.price}</strong>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
