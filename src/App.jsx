import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Nav from './components/Nav'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Home() {
  const navigate = useNavigate()
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold">Cleaning Service Booking</h1>
        <p className="text-gray-600 mt-2">Book trusted cleaners, track jobs, and handle payments securely.</p>
        <div className="mt-4 flex gap-3">
          <button onClick={() => navigate('/book')} className="bg-blue-600 text-white px-4 py-2 rounded">Book a Cleaning</button>
          <a href="/test" className="bg-gray-100 px-4 py-2 rounded">Check Backend</a>
        </div>
      </div>
      <DashboardPreview />
    </div>
  )
}

function DashboardPreview() {
  const [metrics, setMetrics] = useState(null)
  useEffect(() => {
    fetch(`${apiBase}/api/admin/metrics`).then(r => r.json()).then(setMetrics).catch(() => {})
  }, [])
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {['total_bookings','revenue_paid','active_cleaners','users'].map((k) => (
        <div key={k} className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">{k.replace('_',' ')}</p>
          <p className="text-xl font-semibold">{metrics ? metrics[k] : '—'}</p>
        </div>
      ))}
    </div>
  )
}

function Book() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ service_type: 'standard', duration_hours: 2, date: '', time: '', home_size: '1 bed / 1 bath', line1:'', city:'', state:'', postal_code:'' })
  const [estimate, setEstimate] = useState(null)
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || '')

  useEffect(() => {
    fetch(`${apiBase}/api/services`).then(r=>r.json()).then(setServices).catch(()=>{})
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const getEstimate = async () => {
    const scheduled_start = new Date(`${form.date}T${form.time}:00`)
    const res = await fetch(`${apiBase}/api/bookings/estimate`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        customer_id: userId || 'guest', service_type: form.service_type, scheduled_start,
        duration_hours: Number(form.duration_hours), home_size: form.home_size,
        address_line1: form.line1, city: form.city, state: form.state, postal_code: form.postal_code
      })
    })
    const data = await res.json()
    setEstimate(data.price_estimate)
  }

  const createBooking = async () => {
    const scheduled_start = new Date(`${form.date}T${form.time}:00`)
    const res = await fetch(`${apiBase}/api/bookings`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        customer_id: userId || 'guest', service_type: form.service_type, scheduled_start,
        duration_hours: Number(form.duration_hours), home_size: form.home_size,
        address_line1: form.line1, city: form.city, state: form.state, postal_code: form.postal_code
      })
    })
    const data = await res.json()
    alert(`Booking submitted. Price estimate $${data.price_estimate}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Book a Cleaning</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2">Service
          <select name="service_type" value={form.service_type} onChange={handleChange} className="w-full border p-2 rounded">
            {services.length ? services.map(s => <option key={s.name} value={s.name}>{s.display_name}</option>) : (
              <>
                <option value="standard">Standard Cleaning</option>
                <option value="deep">Deep Cleaning</option>
                <option value="move_out">Move-out Cleaning</option>
              </>
            )}
          </select>
        </label>
        <label>Date<input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" /></label>
        <label>Time<input type="time" name="time" value={form.time} onChange={handleChange} className="w-full border p-2 rounded" /></label>
        <label className="col-span-2">Duration (hours)
          <input type="number" step="0.5" min="1" max="12" name="duration_hours" value={form.duration_hours} onChange={handleChange} className="w-full border p-2 rounded"/>
        </label>
        <label className="col-span-2">Home size<input name="home_size" value={form.home_size} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label className="col-span-2">Address line 1<input name="line1" value={form.line1} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label>City<input name="city" value={form.city} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label>State<input name="state" value={form.state} onChange={handleChange} className="w-full border p-2 rounded"/></label>
        <label>Postal Code<input name="postal_code" value={form.postal_code} onChange={handleChange} className="w-full border p-2 rounded"/></label>
      </div>
      <div className="flex gap-3">
        <button onClick={getEstimate} className="bg-gray-100 px-4 py-2 rounded">Get Estimate</button>
        <button onClick={createBooking} className="bg-blue-600 text-white px-4 py-2 rounded">Submit Booking</button>
      </div>
      {estimate !== null && <p className="text-green-700">Estimated Price: ${estimate}</p>}
    </div>
  )
}

function Dashboard() {
  const userId = localStorage.getItem('user_id') || 'guest'
  const [bookings, setBookings] = useState([])
  const [role, setRole] = useState(localStorage.getItem('role') || 'customer')
  useEffect(() => {
    const endpoint = role === 'cleaner' ? 'cleaners' : 'customers'
    fetch(`${apiBase}/api/${endpoint}/${userId}/bookings`).then(r=>r.json()).then(setBookings).catch(()=>{})
  }, [role, userId])
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Bookings</h2>
        <select value={role} onChange={(e)=>{setRole(e.target.value); localStorage.setItem('role', e.target.value)}} className="border p-2 rounded">
          <option value="customer">Customer</option>
          <option value="cleaner">Cleaner</option>
        </select>
      </div>
      <div className="divide-y mt-4">
        {bookings.map(b => (
          <div key={b.id || b._id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{b.service_type} · {new Date(b.scheduled_start).toLocaleString()}</p>
              <p className="text-sm text-gray-600">{b.status} · ${b.price_estimate}</p>
            </div>
            {role === 'cleaner' && (
              <div className="flex gap-2">
                {['on_the_way','in_progress','completed'].map(s => (
                  <button key={s} onClick={async ()=>{
                    await fetch(`${apiBase}/api/bookings/${b._id || b.id}/status`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:s})})
                    location.reload()
                  }} className="px-3 py-1 bg-gray-100 rounded">{s.replaceAll('_',' ')}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Profile() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('customer')

  const signup = async () => {
    const res = await fetch(`${apiBase}/api/auth/signup`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, name, role})})
    const data = await res.json()
    localStorage.setItem('user_id', data.user_id)
    localStorage.setItem('role', data.role)
    alert('Signed up. Your user id is saved locally.')
  }
  const login = async () => {
    const res = await fetch(`${apiBase}/api/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})})
    const data = await res.json()
    localStorage.setItem('user_id', data.user_id)
    localStorage.setItem('role', data.role)
    alert('Logged in.')
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow space-y-3">
      <h2 className="text-xl font-semibold">Profile</h2>
      <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded"/>
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="w-full border p-2 rounded"/>
      <select value={role} onChange={(e)=>setRole(e.target.value)} className="w-full border p-2 rounded">
        <option value="customer">Customer</option>
        <option value="cleaner">Cleaner</option>
        <option value="admin">Admin</option>
      </select>
      <div className="flex gap-2">
        <button onClick={signup} className="bg-blue-600 text-white px-4 py-2 rounded">Sign up</button>
        <button onClick={login} className="bg-gray-100 px-4 py-2 rounded">Log in</button>
      </div>
    </div>
  )
}

function Admin() {
  const [metrics, setMetrics] = useState(null)
  const [name, setName] = useState('standard')
  const [display, setDisplay] = useState('Standard Cleaning')
  const [base, setBase] = useState(50)
  useEffect(()=>{ fetch(`${apiBase}/api/admin/metrics`).then(r=>r.json()).then(setMetrics) },[])
  const createService = async () => {
    await fetch(`${apiBase}/api/services`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name, display_name: display, base_price: Number(base), hourly_multiplier: 1, flat_multiplier: 1, is_active: true})})
    alert('Service created')
  }
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
        <div className="grid md:grid-cols-4 gap-3">
          {metrics && Object.entries(metrics).map(([k,v]) => (
            <div key={k} className="bg-gray-50 rounded p-3">
              <p className="text-gray-500 text-sm">{k.replace('_',' ')}</p>
              <p className="text-lg font-semibold">{String(v)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Service Categories</h3>
        <div className="grid md:grid-cols-4 gap-2">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="name (standard)" className="border p-2 rounded"/>
          <input value={display} onChange={(e)=>setDisplay(e.target.value)} placeholder="display" className="border p-2 rounded"/>
          <input type="number" value={base} onChange={(e)=>setBase(e.target.value)} placeholder="base price" className="border p-2 rounded"/>
          <button onClick={createService} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <Nav />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  )
}
