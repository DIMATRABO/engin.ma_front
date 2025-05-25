export default function Navbar() {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-blue-600">Engin.ma</span>
            <div className="hidden md:flex items-center space-x-8">
              <a className="nav-link" href="#">Browse</a>
              <a className="nav-link" href="#">How it works</a>
              <a className="nav-link" href="#">List your machine</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign In</button>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  