export async function GET() {
    return Response.json([
            {
              id: "1",
              name: "Excavator",
              imageUrl: "/images/excavator.jpg",
              location: "Casablanca",
              pricePerDay: 900,
              rating: 4.8,
              description: "A powerful excavator suitable for heavy-duty construction tasks.",
            },
            {
              id: "2",
              name: "Bulldozer",
              imageUrl: "/images/bulldozer.jpg",
              location: "Rabat",
              pricePerDay: 1200,
              rating: 4.7,
              description: "A robust bulldozer designed for earthmoving and site preparation.",
            },
            {
              id: "3",
              name: "Crane",
              imageUrl: "/images/crane.jpg",
              location: "Marrakech",
              pricePerDay: 1500,
              rating: 4.9,
              description: "A versatile crane for lifting heavy materials at construction sites.",
            },
            {
              id: "4",
              name: "Backhoe Loader",
              imageUrl: "/images/backhoe-loader.jpg",
              location: "Fes",
              pricePerDay: 800,
              rating: 4.6,
              description: "A compact backhoe loader ideal for digging and loading tasks.",
            },
            {
              id: "5",
              name: "Dump Truck",
              imageUrl: "/images/dump-truck.jpg",
              location: "Tangier",
              pricePerDay: 1100,
              rating: 4.5,
              description: "A heavy-duty dump truck for transporting materials across sites.",
            },
            {
              id: "6",
              name: "Skid Steer Loader",
              imageUrl: "/images/skid-steer-loader.jpg",
              location: "Agadir",
              pricePerDay: 700,
              rating: 4.4,
              description: "A versatile skid steer loader for various construction tasks.",
            }
          ])
}

