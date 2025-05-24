import './globals.css'
// Icons will be replaced with simple symbols or emojis for now

interface MachineCard {
  id: string
  name: string
  description: string
  imageUrl: string
  price: string
  rating: number
  location: string
}

const popularMachines: MachineCard[] = [
  {
    id: '1',
    name: 'JCB 3CX Backhoe Loader',
    description: 'Versatile backhoe loader perfect for digging, loading, and construction work.',
    imageUrl: '/api/placeholder/300/200',
    price: '800 MAD/day',
    rating: 4.8,
    location: 'Casablanca'
  },
  {
    id: '2',
    name: 'Bobcat Skid Steer',
    description: 'Compact and maneuverable for tight spaces and versatile attachments.',
    imageUrl: '/api/placeholder/300/200',
    price: '650 MAD/day',
    rating: 4.9,
    location: 'Rabat'
  },
  {
    id: '3',
    name: 'Mini Excavator CAT 305',
    description: 'Ideal for small to medium excavation projects with precision control.',
    imageUrl: '/api/placeholder/300/200',
    price: '950 MAD/day',
    rating: 4.7,
    location: 'Marrakech'
  }
]

const steps = [
  {
    number: '1',
    title: 'Search & Compare',
    description: 'Browse available machines in your area and compare prices instantly'
  },
  {
    number: '2',
    title: 'Book Instantly',
    description: 'Reserve your machine with instant confirmation and secure payment'
  },
  {
    number: '3',
    title: 'Get to Work',
    description: 'Pick up or get delivery and start your project right away'
  }
]

const benefits = [
  {
    icon: '✅',
    title: 'Verified Machines',
    description: 'All equipment is inspected and maintained by certified professionals'
  },
  {
    icon: '🚀',
    title: 'Instant Booking',
    description: 'Book machines instantly with real-time availability and confirmation'
  },
  {
    icon: '💎',
    title: 'Best Prices',
    description: 'Competitive rates with transparent pricing and no hidden fees'
  }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">ENGIN.MA</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Browse</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">How it works</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">List your machine</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find construction machines for your next project
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover and book from thousands of verified machines across Morocco
            </p>
          </div>
          
          {/* Search Bar - Booking.com style */}
          <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900 max-w-5xl">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📍 Location
                </label>
                <input
                  type="text"
                  placeholder="Where do you need equipment?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  🚜 Machine Type
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white">
                    <option>All machines</option>
                    <option>Excavators</option>
                    <option>Bulldozers</option>
                    <option>JCB</option>
                    <option>Bobcat</option>
                    <option>Cranes</option>
                  </select>
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
                </div>
              </div>
              
              <div className="min-w-[140px]">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📅 Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              <div className="min-w-[140px]">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  📅 End Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[120px]">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Machines Section - Booking.com style cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Most popular machines
            </h2>
            <p className="text-xl text-gray-600">
              Top-rated equipment available for immediate booking
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMachines.map((machine) => (
              <div
                key={machine.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🚜</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-sm font-semibold text-gray-700 shadow-sm">
                    ⭐ {machine.rating}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {machine.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {machine.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="mr-1">📍</span>
                    {machine.location}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-gray-900">{machine.price}</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200">
              Show all machines
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How ENGIN.MA works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book construction equipment in minutes with our simple process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why choose ENGIN.MA?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make equipment rental simple, reliable, and hassle-free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Available Machines</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of construction professionals who trust ENGIN.MA for their equipment needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg">
              Find Equipment
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200">
              List Your Machine
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">ENGIN.MA</h3>
              <p className="text-gray-400">
                Morocco's leading platform for construction equipment rental.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Safety</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ENGIN.MA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}