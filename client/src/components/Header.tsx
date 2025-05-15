import React from 'react';
import { Link } from 'wouter';

export function Header() {
  return (
    <header className="border-b py-4">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Game Portal
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-primary transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/games" className="hover:text-primary transition">
                Games
              </Link>
            </li>
            <li>
              <Link href="/auth" className="hover:text-primary transition">
                Login / Register
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}