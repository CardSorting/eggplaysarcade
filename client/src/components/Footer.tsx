import { Link } from "wouter";
import { GamesLogo } from "@/lib/icons";

const Footer = () => {
  return (
    <footer className="bg-background py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <GamesLogo />
            </div>
            <p className="text-gray-400 mb-4">
              The premier platform for HTML5 game developers and players. Discover, play, and share amazing web games.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="ri-instagram-fill text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="ri-discord-fill text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/games">
                  <a className="text-gray-400 hover:text-accent transition">All Games</a>
                </Link>
              </li>
              <li>
                <Link href="/games">
                  <a className="text-gray-400 hover:text-accent transition">Categories</a>
                </Link>
              </li>
              <li>
                <Link href="/games">
                  <a className="text-gray-400 hover:text-accent transition">Top Rated</a>
                </Link>
              </li>
              <li>
                <Link href="/games">
                  <a className="text-gray-400 hover:text-accent transition">New Releases</a>
                </Link>
              </li>
              <li>
                <Link href="/games">
                  <a className="text-gray-400 hover:text-accent transition">Featured Games</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-lg mb-4">Developers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/submit">
                  <a className="text-gray-400 hover:text-accent transition">Submit Game</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Developer Console
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Community Forum
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} GameVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
