import React from 'react';
import { Link } from 'wouter';

export function Header() {
  return (
    <header className="border-b py-4">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold">Game Portal</a>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="hover:text-primary transition">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/games">
                <a className="hover:text-primary transition">Games</a>
              </Link>
            </li>
            <li>
              <Link href="/auth">
                <a className="hover:text-primary transition">Login / Register</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}