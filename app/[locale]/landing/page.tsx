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
      <PopularMachines />;
      <Steps steps={steps} />;
      <Benefits />
      <Stats  stats={data} />
      <CTA />
      <Footer />
    </main>
  )
}
