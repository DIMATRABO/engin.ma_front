export default function Footer() {
    return (
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Engin.ma</h3>
            <p className="text-sm text-gray-400">
              Your trusted platform for hassle-free machine rentals.
            </p>
          </div>
  
          <div>
            <h4 className="text-md font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/machines" className="hover:text-white">Machines</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/about" className="hover:text-white">About Us</a></li>
            </ul>
          </div>
  
          <div>
            <h4 className="text-md font-semibold mb-2">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
  
        <div className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} Engin.ma. All rights reserved.
        </div>
      </footer>
    );
  }
  