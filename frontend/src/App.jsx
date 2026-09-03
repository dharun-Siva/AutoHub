import { BrowserRouter, Navigate, Route, Routes, Link, useLocation, useNavigate, useParams } from 'react-router-dom'
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

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('autohub-user') || 'null')
  } catch {
    return null
  }
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return 'Price on request'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return value
  return `₹${numeric.toLocaleString('en-IN')}`
}

function formatPostDate(dateString) {
  if (!dateString) return 'Date not available'
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return 'Date not available'
  }
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
      <Route path="/sell" element={<SellPage />} />
      <Route path="/my-listings" element={<MyListingsPage />} />
      <Route path="/vehicles/:category" element={<CategoryPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/privacy" element={<InfoPage title="Privacy policy" />} />
      <Route path="/terms" element={<InfoPage title="Terms of use" />} />
      <Route path="/safety" element={<InfoPage title="Safety tips" />} />
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
  onSellClick = () => {},
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = user?.name ? user.name.trim() : 'User'
  const initial = displayName.charAt(0).toUpperCase() || 'U'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      setUnreadCount(0)
      return undefined
    }

    let isMounted = true
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/${user.id}`)
        const data = await response.json()
        if (isMounted) setUnreadCount(data.unread_count || 0)
      } catch (error) {
        console.error('Error fetching unread messages:', error)
      }
    }

    fetchUnreadCount()
    const intervalId = window.setInterval(fetchUnreadCount, 10000)
    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [isLoggedIn, user?.id])

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
        <Link className={location.hash === '#marketplace' ? 'active' : ''} to="/#marketplace">Marketplace</Link>
        <Link className={location.hash === '#how-it-works' ? 'active' : ''} to="/#how-it-works">How it works</Link>
        <Link className={location.hash === '#featured' ? 'active' : ''} to="/#featured">Featured</Link>
        <Link className={location.hash === '#pricing' ? 'active' : ''} to="/#pricing">Pricing</Link>
      </nav>

      <div className="nav-actions">
        {isLoggedIn ? (
          <div className={`user-menu-wrap ${showUserMenu ? 'active' : ''}`}>
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
        <button type="button" className={`primary-btn ${location.pathname === '/sell' ? 'active' : ''}`} onClick={onSellClick}>Sell Now</button>
        <button
          type="button"
          className={`ghost-btn chats-btn ${location.pathname === '/chat' ? 'active' : ''}`}
          onClick={() => (isLoggedIn ? navigate('/chat') : onLoginClick())}
        >
          Chats
          {isLoggedIn && unreadCount > 0 && <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        <button
          type="button"
          className={`ghost-btn my-listings-btn ${location.pathname === '/my-listings' ? 'active' : ''}`}
          onClick={() => (isLoggedIn ? navigate('/my-listings') : onLoginClick())}
        >
          My Listings
        </button>
      </div>
    </header>
  )
}

function SiteFooter({ onSellClick = () => {} }) {
  return (
    <footer className="site-footer" id="pricing">
      <div className="footer-main">
        <div className="footer-intro">
          <p className="brand-name footer-brand">AutoHub</p>
          <span className="brand-tag">Seller → AutoHub → Buyer</span>
          <p>Buy and sell vehicles with confidence through a trusted local marketplace.</p>
          <button type="button" className="primary-btn small" onClick={onSellClick}>Start selling</button>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/#marketplace">Marketplace</Link>
          <Link to="/vehicles/cars">Cars</Link>
          <Link to="/vehicles/bikes">Bikes</Link>
          <Link to="/#how-it-works">How it works</Link>
        </div>

        <div className="footer-column">
          <h3>Support</h3>
          <Link to="/chat">Chats</Link>
          <a href="mailto:support@autohub.in">Contact us</a>
          <a href="tel:+918000000000">+91 80000 00000</a>
          <span>Mon–Sat, 9:00 AM–6:00 PM</span>
        </div>

        <div className="footer-column">
          <h3>Legal</h3>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of use</Link>
          <Link to="/safety">Safety tips</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AutoHub. All rights reserved.</span>
        <span>Made for better vehicle deals.</span>
      </div>
    </footer>
  )
}

function InfoPage({ title }) {
  const navigate = useNavigate()
  const pageContent = {
    'Privacy policy': {
      intro: 'This Privacy Policy explains how AutoHub collects, uses, and protects information when you use our vehicle marketplace.',
      sections: [
        ['Information we collect', 'When you create an account, we collect your name, mobile number, password, role, and district. When you publish a listing, we collect the vehicle details, contact information, description, and photos you provide. We also store conversations and messages sent through AutoHub.'],
        ['How we use information', 'We use this information to create and manage accounts, display listings, connect buyers and sellers, provide chat functionality, improve the service, and respond to support requests. We do not use your information for purposes unrelated to operating AutoHub without your consent.'],
        ['Sharing information', 'Listing details and any contact information you include in a listing may be visible to other users. Messages are shared with the participants in the relevant conversation. We do not sell personal information. We may disclose information when required by law or when needed to protect the security and rights of AutoHub or its users.'],
        ['Data security and retention', 'We take reasonable steps to protect account and marketplace data. No online service can guarantee complete security. We retain information while your account or related transaction records are needed to operate the service, resolve disputes, meet legal obligations, or prevent misuse.'],
        ['Your choices', 'You may stop using AutoHub and contact us about correcting account information or requesting account-related assistance. Some listing or transaction records may need to be retained for legal, security, or operational reasons.'],
        ['Contact us', 'For privacy questions or requests, email support@autohub.in.'],
      ],
    },
    'Terms of use': {
      intro: 'These Terms of Use govern your access to AutoHub and your use of its marketplace, listings, and messaging features.',
      sections: [
        ['Using AutoHub', 'You must provide accurate information, keep your login details secure, and use the service only for lawful purposes. You are responsible for activity performed through your account.'],
        ['Listings and messages', 'Sellers must have the right to offer a vehicle and must provide truthful, current details, prices, photos, and contact information. Users must not post misleading, fraudulent, abusive, illegal, or harmful content, or use chat to send spam or threats.'],
        ['Transactions between users', 'AutoHub provides a platform for buyers and sellers to find each other. AutoHub is not the owner, seller, buyer, broker, or guarantor of any vehicle and does not verify ownership, condition, documents, mileage, price, or payment. Users must inspect vehicles, verify documents and identity, and agree on transaction terms independently.'],
        ['Prohibited activity', 'Do not impersonate another person, access another account, upload malicious material, scrape the service, interfere with its operation, or use AutoHub to violate any law or another person\'s rights.'],
        ['Content and moderation', 'You retain responsibility for content you submit and grant AutoHub permission to display it as needed to operate the service. We may remove content, restrict access, or suspend accounts that breach these terms or create risk for users or the service.'],
        ['Disclaimer and changes', 'AutoHub is provided on an as-is and as-available basis. We do not promise that every listing or user is accurate, available, safe, or suitable for a particular purpose. We may update these terms or features from time to time; continued use after an update means you accept the revised terms.'],
        ['Contact us', 'For questions about these terms, email support@autohub.in.'],
      ],
    },
    'Safety tips': {
      intro: 'Use these practical steps to help keep your vehicle search, conversations, and transactions safer.',
      sections: [
        ['Before you meet', 'Keep early conversations in AutoHub chat. Meet in a public, well-lit place during the day and tell someone you trust where you are going. Consider taking another person with you.'],
        ['Check the vehicle', 'Inspect the vehicle in person, compare the registration and identification details with the documents, and arrange an independent mechanic inspection. Do not rely only on photos or a seller\'s description.'],
        ['Verify the seller and documents', 'Confirm the seller\'s identity and right to sell. Check registration, insurance, loan or lien status, service history, and any applicable transfer requirements with the relevant authority before paying.'],
        ['Pay safely', 'Never share passwords, one-time passcodes, card PINs, or banking credentials. Be cautious of advance-payment pressure, unusually low prices, remote-only sellers, payment links, and requests to move money through unfamiliar accounts.'],
        ['Report suspicious activity', 'Stop communicating if a user makes threats, requests sensitive information, or pressures you to pay. Save relevant messages and listing details, then contact support@autohub.in. For immediate danger, contact local emergency services.'],
        ['Important reminder', 'AutoHub does not hold payments or guarantee a vehicle, seller, buyer, or transaction. You are responsible for making independent checks before completing a deal.'],
      ],
    },
  }[title]

  return (
    <div className="app-shell info-page">
      <AppHeader onSellClick={() => navigate('/sell')} />
      <main className="info-page-main">
        <span className="eyebrow">AutoHub</span>
        <h1>{title}</h1>
        <p className="info-page-updated">Last updated: September 3, 2026</p>
        <p className="info-page-intro">{pageContent.intro}</p>
        <div className="info-page-sections">
          {pageContent.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
        <button type="button" className="secondary-btn" onClick={() => navigate('/')}>Back to home</button>
      </main>
    </div>
  )
}

function MyListingsPage() {
  const navigate = useNavigate()
  const [user] = useState(getStoredUser)
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      navigate('/', { replace: true })
      return undefined
    }

    fetch(`${API_BASE_URL}/api/listings/user/${user.id}`)
      .then((response) => response.json())
      .then((data) => setListings(data.listings || []))
      .catch((error) => {
        console.error('Error fetching my listings:', error)
        setListings([])
      })
      .finally(() => setIsLoading(false))
  }, [navigate, user?.id])

  if (!user) return <Navigate to="/" replace />

  return (
    <div className="category-page-shell my-listings-page">
      <AppHeader
        isLoggedIn
        user={user}
        onSellClick={() => navigate('/sell')}
        onLogout={() => {
          localStorage.removeItem('autohub-user')
          navigate('/', { replace: true })
        }}
      />
      <main className="category-page-main">
        <div className="category-page-top">
          <button type="button" className="my-listings-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <span className="eyebrow">Seller workspace</span>
          <h1>My listings</h1>
          <p className="my-listings-subtitle">Vehicles posted from your AutoHub account.</p>
        </div>

        {isLoading ? (
          <div className="empty-category-box"><p>Loading your listings...</p></div>
        ) : listings.length === 0 ? (
          <div className="empty-category-box">
            <div className="empty-category-icon">🚘</div>
            <h2>No listings yet</h2>
            <p>You have not posted a vehicle from this account.</p>
            <button type="button" className="primary-btn" onClick={() => navigate('/sell')}>Post a vehicle</button>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map((listing) => (
              <article className="listing-card my-listing-card" key={listing.id}>
                <div className="listing-image">
                  {listing.images?.[0] ? <img src={`${API_BASE_URL}${listing.images[0]}`} alt={listing.title} /> : <div className="listing-placeholder">No photo</div>}
                </div>
                <div className="listing-body">
                  <div className="listing-header">
                    <div>
                      <p className="listing-type">{listing.type}</p>
                      <h3>{listing.title}</h3>
                    </div>
                    <strong>{formatPrice(listing.price)}</strong>
                  </div>
                  <p className="listing-meta">{listing.location || 'Location not specified'}</p>
                  <span className="my-listing-date">Posted on: {formatPostDate(listing.created_at)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(getStoredUser)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredUser()))
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
  const [storedListings, setStoredListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [pendingSell, setPendingSell] = useState(false)
  const navigate = useNavigate()
  const latestListing = storedListings[0] ?? null
  const latestListingImage = latestListing?.images?.[0] ? `${API_BASE_URL}${latestListing.images[0]}` : null

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
      localStorage.setItem('autohub-user', JSON.stringify(userData))
      setShowUserMenu(false)
      setIsLoginOpen(false)
      if (pendingSell) {
        setPendingSell(false)
        navigate('/sell')
      }
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
    localStorage.removeItem('autohub-user')
  }

  const handleSellClick = () => {
    if (isLoggedIn) {
      navigate('/sell')
      return
    }

    setPendingSell(true)
    setFormMode('login')
    setIsLoginOpen(true)
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/listings`)
      .then((response) => response.json())
      .then((data) => setStoredListings(data.listings || []))
      .catch(() => setStoredListings([]))
  }, [])

  const openListingModal = (listing) => {
    if (!isLoggedIn) {
      setSelectedListing({ ...listing, locked: true })
      return
    }

    setSelectedListing({ ...listing, locked: false })
  }

  const closeListingModal = () => {
    setSelectedListing(null)
  }

  const handleDetailsLogin = () => {
    closeListingModal()
    setPendingSell(false)
    setFormMode('login')
    setIsLoginOpen(true)
  }

  return (
    <div className="app-shell">
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
        onSellClick={handleSellClick}
      />

      {selectedListing && (
        <div className="modal-overlay" onClick={closeListingModal}>
          <div className="listing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="auth-brand-row">
                <div className="mini-brand">DS</div>
                <span>AutoHub</span>
              </div>
              <button type="button" className="close-btn" onClick={closeListingModal} aria-label="Close listing details">×</button>
            </div>

            {selectedListing.locked ? (
              <div className="listing-locked-state">
                <p className="modal-kicker">Private details</p>
                <h3>Please login to view details</h3>
                <p>Sign in to see full photos, seller information, and complete vehicle details.</p>
                <button type="button" className="primary-btn auth-submit" onClick={handleDetailsLogin}>Login</button>
              </div>
            ) : (
              <>
                <div className="listing-modal-gallery">
                  {(selectedListing.images && selectedListing.images.length > 0)
                    ? selectedListing.images.map((image, index) => (
                        <img key={`${selectedListing.title}-${index}`} src={`${API_BASE_URL}${image}`} alt={`${selectedListing.title} ${index + 1}`} />
                      ))
                    : <div className="listing-placeholder">Vehicle photo</div>}
                </div>

                <div className="listing-modal-body">
                  <div className="listing-header-row">
                    <div>
                      <p className="listing-type">{selectedListing.type}</p>
                      <h3>{selectedListing.title}</h3>
                    </div>
                    <strong>{selectedListing.price}</strong>
                  </div>

                  <div className="listing-detail-grid">
                    <div><span>Location</span><strong>{selectedListing.location || 'Not specified'}</strong></div>
                    <div><span>Contact</span><strong>{selectedListing.contact || 'Not shared'}</strong></div>
                    <div><span>Category</span><strong>{selectedListing.type || 'Vehicle'}</strong></div>
                    <div><span>Seller</span><strong>{selectedListing.seller || 'Private seller'}</strong></div>
                    <div><span>Posted on</span><strong>{formatPostDate(selectedListing.created_at)}</strong></div>
                  </div>

                  <div className="listing-description-block">
                    <span>Description</span>
                    <p>{selectedListing.description || 'No description provided for this vehicle yet.'}</p>
                  </div>

                  {isLoggedIn && loggedInUser && loggedInUser.id !== selectedListing.seller_id && (
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ width: '100%', marginTop: '20px' }}
                      onClick={() => {
                        if (selectedListing?.id && selectedListing?.seller_id) {
                          const chatUrl = `/chat?listing_id=${selectedListing.id}&seller_id=${selectedListing.seller_id}`
                          closeListingModal()
                          setTimeout(() => navigate(chatUrl), 50)
                        } else {
                          console.error('Chat data missing:', selectedListing)
                          alert('Unable to start chat. Please try again.')
                        }
                      }}
                    >
                      Chat with Seller
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
              <Link to="/vehicles/all" className="primary-btn large">Explore vehicles</Link>
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
            <div
              className="hero-card main-card"
              onClick={() => latestListing && openListingModal(latestListing)}
              role={latestListing ? 'button' : undefined}
              tabIndex={latestListing ? 0 : -1}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && latestListing) {
                  event.preventDefault()
                  openListingModal(latestListing)
                }
              }}
            >
              <div className="card-top">
                <span className="dot green" />
                <span className="dot" />
                <span className="dot" />
                <span style={{ marginLeft: 'auto', fontSize: '0.95rem', fontWeight: '600', color: '#2c3e50', letterSpacing: '0.3px' }}>
                  {latestListing ? `Posted on: ${formatPostDate(latestListing.created_at)}` : 'No date'}
                </span>
              </div>

              {latestListing ? (
                <>
                  <div className="vehicle-illustration">
                    {latestListingImage ? (
                      <img className="hero-listing-photo" src={latestListingImage} alt={latestListing.title} />
                    ) : (
                      <div className="vehicle-placeholder">No listing photo</div>
                    )}
                  </div>
                  <div className="vehicle-info">
                    <div>
                      <p>Featured Deal</p>
                      <strong>{latestListing.title}</strong>
                    </div>
                    <span>{formatPrice(latestListing.price)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="vehicle-illustration">
                    <div className="vehicle-placeholder">No listings yet</div>
                  </div>
                  <div className="vehicle-info">
                    <div>
                      <p>Featured Deal</p>
                      <strong>No vehicle listed</strong>
                    </div>
                    <span>Be the first</span>
                  </div>
                </>
              )}
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
          </div>

          <div className="listing-grid featured-preview-grid">
            {storedListings.slice(0, 3).map((listing) => (
              <article
                className="listing-card"
                key={`listing-${listing.id}`}
                onClick={() => openListingModal(listing)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openListingModal(listing)
                  }
                }}
              >
                <div className="listing-image">
                  {listing.images?.[0] && <img src={`${API_BASE_URL}${listing.images[0]}`} alt={listing.title} />}
                  <span className="listing-badge">{listing.tag || 'Featured'}</span>
                </div>
                <div className="listing-body">
                  <div className="listing-header">
                    <div>
                      <p className="listing-type">{listing.type}</p>
                      <h3>{listing.title}</h3>
                    </div>
                    <strong>{listing.price}</strong>
                  </div>
                  <p className="listing-meta">{listing.location || 'Location not specified'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className="primary-btn small"
                      onClick={(event) => {
                        event.stopPropagation()
                        openListingModal(listing)
                      }}
                    >
                      Details
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Posted on: {formatPostDate(listing.created_at)}</span>
                  </div>
                </div>
              </article>
            ))}
            <Link
              to="/vehicles/all"
              className="listing-next-arrow"
              aria-label="View all vehicle listings"
              title="View all vehicle listings"
            >
              <span>Explore all vehicles</span>
              <strong aria-hidden="true">→</strong>
            </Link>
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

      <SiteFooter onSellClick={handleSellClick} />
    </div>
  )
}

function SellPage() {
  const navigate = useNavigate()
  const storedUser = getStoredUser()
  const [formData, setFormData] = useState({ title: '', price: '', category: 'Cars', location: '', contact: '', description: '' })
  const [images, setImages] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('autohub-user')) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrorMessage('')
  }

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)

    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    }))).then((imageUrls) => {
      setImages(imageUrls)
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const requiredFields = ['title', 'price', 'category', 'location', 'contact', 'description']
    if (requiredFields.some((field) => !formData[field].trim())) {
      setErrorMessage('Please complete all listing details.')
      return
    }

    const storedUser = getStoredUser()
    const payload = new FormData()
    payload.append('seller_id', storedUser.id)
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value))

    selectedFiles.forEach((file) => payload.append('photos', file))

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings`, { method: 'POST', body: payload })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Unable to publish listing.')
      navigate('/#featured')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="category-page-shell">
      <AppHeader isLoggedIn={Boolean(storedUser)} user={storedUser} onSellClick={() => {}} />
      <main className="sell-page-main">
        <div className="sell-page-intro">
          <span className="eyebrow">Seller workspace</span>
          <h1>List your vehicle</h1>
          <p>Share the details buyers need to make a confident decision.</p>
        </div>
        <form className="sell-form" onSubmit={handleSubmit}>
          {errorMessage && <p className="form-error">{errorMessage}</p>}
          <label className="photo-upload">
            <span>Vehicle photos</span>
            <input name="photos" type="file" accept="image/*" multiple onChange={handleImageChange} />
            {images.length > 0 ? (
              <div className="photo-preview-grid">
                {images.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`Selected vehicle preview ${index + 1}`} />
                ))}
              </div>
            ) : (
              <strong>Choose vehicle photos</strong>
            )}
          </label>
          <div className="sell-form-grid">
            <label><span>Title</span><input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. 2022 Hyundai Creta" /></label>
            <label><span>Price (₹)</span><input name="price" type="number" min="0" value={formData.price} onChange={handleInputChange} placeholder="Enter asking price" /></label>
            <label><span>Category</span><select name="category" value={formData.category} onChange={handleInputChange}>{categories.map((category) => <option key={category.slug}>{category.label}</option>)}</select></label>
            <label><span>Location</span><input name="location" value={formData.location} onChange={handleInputChange} placeholder="City or district" /></label>
            <label><span>Contact number</span><input name="contact" inputMode="numeric" value={formData.contact} onChange={handleInputChange} placeholder="10-digit mobile number" /></label>
          </div>
          <label><span>Description</span><textarea name="description" rows="5" value={formData.description} onChange={handleInputChange} placeholder="Tell buyers about condition, ownership, and key details" /></label>
          <div className="sell-form-actions"><button type="button" className="secondary-btn" onClick={() => navigate('/')}>Cancel</button><button type="submit" className="primary-btn">Publish listing</button></div>
        </form>
      </main>
    </div>
  )
}

function CategoryPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [selectedListing, setSelectedListing] = useState(null)

  const categoryInfo = categories.find((item) => item.slug === category) ?? {
    label: category === 'all' ? 'All vehicles' : 'Vehicles',
    icon: '🚘',
    slug: 'vehicles',
  }

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setIsLoggedIn(true)
      setLoggedInUser(storedUser)
    }

    const fetchListings = async () => {
      try {
        const endpoint = category === 'all'
          ? `${API_BASE_URL}/api/listings`
          : `${API_BASE_URL}/api/listings/category/${category}`
        const response = await fetch(endpoint)
        const data = await response.json()
        setListings(data.listings || [])
      } catch (error) {
        console.error('Error fetching listings:', error)
        setListings([])
      }
    }

    fetchListings()
  }, [category])

  const openListingModal = (listing) => {
    if (!isLoggedIn) {
      listing.locked = true
    }
    setSelectedListing(listing)
  }

  const closeListingModal = () => {
    setSelectedListing(null)
  }

  const handleDetailsLogin = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="category-page-shell">
      <AppHeader
        isLoggedIn={isLoggedIn}
        user={loggedInUser}
        onLoginClick={() => {}}
        onToggleUserMenu={() => {}}
        onLogout={() => {}}
        onSellClick={() => {}}
      />

      {selectedListing && (
        <div className="modal-overlay" onClick={closeListingModal}>
          <div className="listing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="auth-brand-row">
                <div className="mini-brand">DS</div>
                <span>AutoHub</span>
              </div>
              <button type="button" className="close-btn" onClick={closeListingModal} aria-label="Close listing details">×</button>
            </div>

            {selectedListing.locked ? (
              <div className="listing-locked-state">
                <p className="modal-kicker">Private details</p>
                <h3>Please login to view details</h3>
                <p>Sign in to see full photos, seller information, and complete vehicle details.</p>
                <button type="button" className="primary-btn auth-submit" onClick={handleDetailsLogin}>Login</button>
              </div>
            ) : (
              <>
                <div className="listing-modal-gallery">
                  {(selectedListing.images && selectedListing.images.length > 0)
                    ? selectedListing.images.map((image, index) => (
                        <img key={`${selectedListing.title}-${index}`} src={`${API_BASE_URL}${image}`} alt={`${selectedListing.title} ${index + 1}`} />
                      ))
                    : <div className="listing-placeholder">Vehicle photo</div>}
                </div>

                <div className="listing-modal-body">
                  <div className="listing-header-row">
                    <div>
                      <p className="listing-type">{selectedListing.type}</p>
                      <h3>{selectedListing.title}</h3>
                    </div>
                    <strong>{formatPrice(selectedListing.price)}</strong>
                  </div>

                  <div className="listing-detail-grid">
                    <div><span>Location</span><strong>{selectedListing.location || 'Not specified'}</strong></div>
                    <div><span>Contact</span><strong>{selectedListing.contact || 'Not shared'}</strong></div>
                    <div><span>Category</span><strong>{selectedListing.type || 'Vehicle'}</strong></div>
                    <div><span>Seller</span><strong>{selectedListing.seller || 'Private seller'}</strong></div>
                    <div><span>Posted on</span><strong>{formatPostDate(selectedListing.created_at)}</strong></div>
                  </div>

                  <div className="listing-description-block">
                    <span>Description</span>
                    <p>{selectedListing.description || 'No description provided for this vehicle yet.'}</p>
                  </div>

                  {isLoggedIn && loggedInUser && loggedInUser.id !== selectedListing.seller_id && (
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ width: '100%', marginTop: '20px' }}
                      onClick={() => {
                        if (selectedListing?.id && selectedListing?.seller_id) {
                          const chatUrl = `/chat?listing_id=${selectedListing.id}&seller_id=${selectedListing.seller_id}`
                          closeListingModal()
                          setTimeout(() => navigate(chatUrl), 50)
                        } else {
                          console.error('Chat data missing:', selectedListing)
                          alert('Unable to start chat. Please try again.')
                        }
                      }}
                    >
                      Chat with Seller
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <main className="category-page-main">
        <div className="category-page-top">
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '20px',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              color: '#333',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5'
              e.target.style.borderColor = '#999'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = '#ddd'
            }}
          >
            ← Back to Home
          </button>
          <h1>{categoryInfo.label}</h1>
        </div>

        {listings.length === 0 ? (
          <div className="empty-category-box">
            <div className="empty-category-icon">{categoryInfo.icon}</div>
            <h2>No {categoryInfo.label.toLowerCase()} listed yet</h2>
            <p>{category === 'all' ? 'Be the first one to post a vehicle on AutoHub.' : `Be the first one to post a ${categoryInfo.label.toLowerCase()} in this category.`}</p>
            <Link to="/" className="primary-btn">Back to home</Link>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map((listing) => (
              <article
                className="listing-card"
                key={`listing-${listing.id}`}
                onClick={() => openListingModal(listing)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openListingModal(listing)
                  }
                }}
              >
                <div className="listing-image">
                  {listing.images?.[0] && <img src={`${API_BASE_URL}${listing.images[0]}`} alt={listing.title} />}
                  <span className="listing-badge">{listing.tag || 'Featured'}</span>
                </div>
                <div className="listing-body">
                  <div className="listing-header">
                    <div>
                      <p className="listing-type">{listing.type}</p>
                      <h3>{listing.title}</h3>
                    </div>
                    <strong>{formatPrice(listing.price)}</strong>
                  </div>
                  <p className="listing-meta">{listing.location || 'Location not specified'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      className="primary-btn small"
                      onClick={(event) => {
                        event.stopPropagation()
                        openListingModal(listing)
                      }}
                    >
                      Details
                    </button>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Posted on: {formatPostDate(listing.created_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ChatPage() {
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const listingId = parseInt(searchParams.get('listing_id') || '0', 10)
  const sellerId = parseInt(searchParams.get('seller_id') || '0', 10)

  console.log('ChatPage loaded with:', { listingId, sellerId })

  const [loggedInUser, setLoggedInUser] = useState(getStoredUser)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredUser()))
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const storedUser = getStoredUser()
    console.log('User check:', storedUser)
    
    if (!storedUser) {
      console.log('No user found, redirecting to home')
      navigate('/', { replace: true })
      return
    }

    setIsLoggedIn(true)
    setLoggedInUser(storedUser)
    console.log('User logged in:', storedUser.id)

    const fetchConversations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/${storedUser.id}`)
        const data = await response.json()
        setConversations(data.conversations || [])

        if (listingId && sellerId) {
          const existingConv = (data.conversations || []).find(
            (c) => c.listing_id === listingId && c.other_user_id === sellerId
          )
          if (existingConv) {
            setSelectedConversation(existingConv)
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
    const intervalId = window.setInterval(fetchConversations, 10000)
    return () => window.clearInterval(intervalId)
  }, [navigate, listingId, sellerId])

  useEffect(() => {
    if (!selectedConversation?.id || !loggedInUser?.id) return undefined

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/${selectedConversation.id}/messages`)
        const data = await response.json()
        setMessages(data.messages || [])
        await fetch(`${API_BASE_URL}/api/conversations/${selectedConversation.id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ user_id: loggedInUser.id }),
        })
        setConversations((previous) => previous.map((conversation) => (
          conversation.id === selectedConversation.id
            ? { ...conversation, unread_count: 0 }
            : conversation
        )))
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
    const intervalId = window.setInterval(fetchMessages, 5000)
    return () => window.clearInterval(intervalId)
  }, [selectedConversation, loggedInUser?.id])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      if (!selectedConversation.id) {
        const response = await fetch(`${API_BASE_URL}/api/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            buyer_id: loggedInUser.id,
            seller_id: sellerId || selectedConversation.seller_id,
            listing_id: listingId || selectedConversation.listing_id,
            message_text: messageInput,
          }),
        })
        const data = await response.json()
        if (data.status === 'success') {
          setMessageInput('')
          setSelectedConversation({ ...selectedConversation, id: data.conversation_id })
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            conversation_id: selectedConversation.id,
            sender_id: loggedInUser.id,
            message_text: messageInput,
          }),
        })
        const data = await response.json()
        if (data.status === 'success') {
          setMessages([...messages, data.message])
          setMessageInput('')
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCreateNewConversation = async () => {
    if (!listingId || !sellerId) return
    if (sellerId === loggedInUser.id) {
      alert("You can't chat with yourself!")
      return
    }

    setSelectedConversation({
      id: null,
      listing_id: listingId,
      seller_id: sellerId,
      other_user_id: sellerId,
      listing_title: 'New Conversation',
    })
    setMessages([])
    setMessageInput('')
  }

  const handleChatLogout = () => {
    localStorage.removeItem('autohub-user')
    navigate('/', { replace: true })
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="chat-page-shell">
      <AppHeader
        isLoggedIn={isLoggedIn}
        user={loggedInUser}
        onLoginClick={() => {}}
        showUserMenu={showUserMenu}
        onToggleUserMenu={() => setShowUserMenu((previous) => !previous)}
        onLogout={handleChatLogout}
        onSellClick={() => navigate('/sell')}
      />

      <main className="chat-page-main">
        <div className="chat-container">
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h2>Messages</h2>
              {listingId && sellerId && (
                <button
                  type="button"
                  className="primary-btn small"
                  onClick={handleCreateNewConversation}
                  style={{ fontSize: '0.85rem' }}
                >
                  + New Chat
                </button>
              )}
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''} ${conv.unread_count ? 'unread' : ''}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="conversation-name-row">
                      <strong>{conv.other_user_name}</strong>
                      {conv.unread_count > 0 && <span className="conversation-unread-count">{conv.unread_count}</span>}
                    </div>
                    <div className="conversation-listing">
                      {conv.listing_title}
                    </div>
                    <div className="conversation-preview">
                      {conv.last_message ? conv.last_message.substring(0, 50) : 'No messages yet'}
                    </div>
                    {conv.last_message_time ? (
                      <div className="conversation-date">
                        {(() => {
                          try {
                            return new Date(conv.last_message_time).toLocaleDateString()
                          } catch (e) {
                            return ''
                          }
                        })()}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chat-main">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <button
                    type="button"
                    className="chat-back-button"
                    onClick={() => navigate('/vehicles/cars')}
                  >
                    ←
                  </button>
                  <div>
                    <h3>{selectedConversation.other_user_name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>{selectedConversation.listing_title}</p>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`message ${msg.sender_id === loggedInUser.id ? 'sent' : 'received'}`}
                      >
                        <div
                          className="message-bubble"
                        >
                          <p className="message-text">{msg.message_text}</p>
                          <p className="message-time">
                            {(() => {
                              try {
                                return new Date(msg.created_at).toLocaleTimeString()
                              } catch (e) {
                                return ''
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="chat-input-area">
                  <input
                    className="chat-message-input"
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type your message..."
                  />
                  <button
                    type="button"
                    className="primary-btn chat-send-button"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                {listingId && sellerId ? (
                  <button
                    type="button"
                    className="primary-btn large"
                    onClick={handleCreateNewConversation}
                  >
                    Start Chatting
                  </button>
                ) : (
                  <p>Select a conversation to view messages</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
