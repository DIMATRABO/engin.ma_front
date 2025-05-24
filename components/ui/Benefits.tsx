export default function Benefits() {
    const benefits = [
      {
        title: "Verified Machines",
        description: "All listings are manually verified for reliability and safety.",
      },
      {
        title: "Nationwide Coverage",
        description: "Find machines anywhere in Morocco with location-based search.",
      },
      {
        title: "Flexible Booking",
        description: "Book by the day, week, or project duration with transparent pricing.",
      },
    ];
  
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Why choose Engin.ma?</h2>
          <p className="section-subtitle mb-12">
            We make machine rental easy, transparent, and reliable.
          </p>
  
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  