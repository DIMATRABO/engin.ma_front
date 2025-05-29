'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string
  onSearch: (filters: { location: string; machineType: string }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const t = useTranslations('search')

    // State for filters
    const [location, setLocation] = useState('');
    const [machineType, setMachineType] = useState('');
  
    const handleSearch = () => {
      // Log filters and call onSearch
      const filters = { location, machineType };
      console.log('Filters:', filters);
      onSearch(filters);
    };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 text-gray-900 max-w-5xl">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            📍 {t('location')}
          </label>
          <input
            type="text"
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('locationPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            🚜 {t('machineType')}
          </label>
          <div className="relative">
            <select 
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none bg-white">
              <option>{t('allMachines')}</option>
              <option>{t('excavators')}</option>
              <option>{t('bulldozers')}</option>
              <option>{t('jcb')}</option>
              <option>{t('bobcat')}</option>
              <option>{t('cranes')}</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
          </div>
        </div>

        <div className="min-w-[140px]">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            📅 {t('startDate')}
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        <div className="min-w-[140px]">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            📅 {t('endDate')}
          </label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        <button 
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg min-w-[120px]">
          {t('search')}
        </button>
      </div>
    </div>
  )
}
