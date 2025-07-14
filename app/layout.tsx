// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Engin.ma',
  description: 'JCB machine rental platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}