"use client";
import Navbar from '../../../components/ui/Navbar'
import Hero from '../../../components/ui/Hero'
import PopularMachines from '../../../components/ui/PopularMachines'
import Steps from '../../../components/ui/Steps'
import Benefits from '../../../components/ui/Benefits'
import Stats from '../../../components/ui/Stats'
import CTA from '../../../components/ui/CTA'
import Footer from '../../../components/ui/Footer'

import { Search,Users, CalendarDays, FileCheck2, Truck, Building2, Star  } from "lucide-react";


interface PageProps {
  params: Promise<{ locale: string }>; // Correct type for params
}


export default async function Home({ params }: PageProps) {
  const { locale } = await params; // Await the promise to resolve params
  const machines = [
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
  ]

  const steps = [
    {
      title: "Search Machine",
      description: "Browse our collection of construction machines.",
      icon: <Search className="w-6 h-6" />,
    },
    {
      title: "Check Availability",
      description: "Choose your dates and location to check availability.",
      icon: <CalendarDays className="w-6 h-6" />,
    },
    {
      title: "Book Securely",
      description: "Reserve your machine with secure payment options.",
      icon: <FileCheck2 className="w-6 h-6" />,
    },
    {
      title: "Receive & Use",
      description: "Get the machine delivered and start working.",
      icon: <Truck className="w-6 h-6" />,
    },
  ];
  const data = [
    { label: "Machines Listed", value: "1,250+", icon: <Truck className="w-6 h-6" /> },
    { label: "Clients Served", value: "3,400+", icon: <Users className="w-6 h-6" /> },
    { label: "Cities Covered", value: "85", icon: <Building2 className="w-6 h-6" /> },
    { label: "Avg. Rating", value: "4.9/5", icon: <Star className="w-6 h-6" /> },
  ];
  return (
    <main className="min-h-screen bg-white">
      <Navbar locale={locale} />
      <Hero />
      <PopularMachines machines={machines} />;
      <Steps steps={steps} />;
      <Benefits />
      <Stats  stats={data} />
      <CTA />
      <Footer />
    </main>
  )
}
