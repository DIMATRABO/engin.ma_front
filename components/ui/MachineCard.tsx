type Machine = {
    id: string;
    name: string;
    imageUrl: string;
    location: string;
    pricePerDay: number;
    rating: number;
    description: string;

  };
  
  interface MachineCardProps {
    machine: Machine;
    onBook?: (id: string) => void;
  }
  
  export default function MachineCard({ machine, onBook }: MachineCardProps) {
    return (
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
            <span className="text-xl font-bold text-gray-900">{machine.pricePerDay}</span>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
            View Details
          </button>
        </div>
      </div>
    </div>
    );
  }
  