import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-muted/30 py-8 border-t">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Game Portal</h3>
            <p className="text-muted-foreground text-sm">
              The ultimate HTML5 gaming platform for players and developers.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
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
                <Link href="/categories" className="hover:text-primary transition">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">For Developers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/developer" className="hover:text-primary transition">
                  Developer Account
                </Link>
              </li>
              <li>
                <Link href="/submit-game" className="hover:text-primary transition">
                  Submit a Game
                </Link>
              </li>
              <li>
                <Link href="/developer-docs" className="hover:text-primary transition">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-primary transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-muted text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Game Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}