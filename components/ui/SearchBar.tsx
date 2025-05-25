"use client";

import { useState } from "react";
//import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ placeholder = "Search machines...", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  /*
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };
  */

  return (
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
  );
}
