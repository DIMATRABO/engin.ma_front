'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import MachineCard from './MachineCard';

type Machine = {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
  pricePerDay: number;
  rating: number;
  description: string;
};

export default function PopularMachines() {
  const t = useTranslations('popular');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch('/api/machine');
        if (!res.ok) {
          throw new Error('Failed to fetch machines');
        }
        const data = await res.json();
        setMachines(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">{t('title')}</h2>
        {loading && <p>{t('loading')}</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && machines.length === 0 && <p>{t('noMachines')}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      </div>
    </section>
  );
}