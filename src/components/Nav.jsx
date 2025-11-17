import { Link, NavLink } from 'react-router-dom'

export default function Nav() {
  const navLink = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50'}`

  return (
    <nav className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-blue-700">Cleanly</Link>
          <div className="flex gap-2">
            <NavLink className={navLink} to="/book">Book a Cleaning</NavLink>
            <NavLink className={navLink} to="/dashboard">My Bookings</NavLink>
            <NavLink className={navLink} to="/profile">Profile</NavLink>
            <NavLink className={navLink} to="/admin">Admin</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
