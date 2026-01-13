import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function Layout() {
  const location = useLocation();

  const isCustomer = location.pathname.startsWith('/customer');
  const isDriver = location.pathname.startsWith('/driver');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo variant="full" size="md" />
            </Link>

            {/* Navigation */}
            <nav className="flex gap-2">
              <Link
                to="/customer"
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  isCustomer
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                고객
              </Link>
              <Link
                to="/driver"
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  isDriver
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                드라이버
              </Link>
              <Link
                to="/admin"
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  isAdmin
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                관리자
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-500 text-sm mb-1">© 2026 BUTAXI. Share your ride</p>
          <p className="text-gray-400 text-xs">MVP Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
