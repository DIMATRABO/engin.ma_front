import SearchBar from './SearchBar';

export default function Hero() {
  return (
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
        <SearchBar onSearch={(query) => {
        // handle search logic here
        console.log("Search query:", query);
        }} />
      </div>
    </section>
  );
}
