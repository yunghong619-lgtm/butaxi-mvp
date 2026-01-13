import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const isCustomer = location.pathname.startsWith('/customer');
  const isDriver = location.pathname.startsWith('/driver');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">🚖 RETURN</h1>
              <span className="text-sm text-gray-500">공유 택시 예약 서비스</span>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-4">
              <Link
                to="/customer"
                className={`px-4 py-2 rounded-lg ${
                  isCustomer
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                고객
              </Link>
              <Link
                to="/driver"
                className={`px-4 py-2 rounded-lg ${
                  isDriver
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                기사
              </Link>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg ${
                  isAdmin
                    ? 'bg-primary-600 text-white'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 RETURN. 함께 가는 즐거운 여정 🚖</p>
          <p className="mt-2">MVP Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
