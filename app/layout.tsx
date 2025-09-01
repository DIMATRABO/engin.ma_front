// app/layout.tsx
import './globals.css';
import {ReactNode} from 'react';
import {defaultMetadata} from '@/lib/seo';

export const metadata = defaultMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  // Intentionally return only children to let locale layout wrap html/body via next-intl
  return children;
}