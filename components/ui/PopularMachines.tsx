import MachineCard from "./MachineCard";

type Machine = {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  pricePerDay: number;
};

interface PopularMachinesProps {
  machines: Machine[];
  //onBook?: (id: string) => void;
}

export default function PopularMachines({ 
  machines
  //,onBook 
  }: PopularMachinesProps) {
  return (
    <section className="py-16 bg-gray-50">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Machines</h2>
      </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} //onBook={onBook} 
            />
          ))}
        </div>
      </div>
      <div className="text-center mt-8">
            <button className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200">
              Show all machines
            </button>
      </div>
    </section>
  );
}
