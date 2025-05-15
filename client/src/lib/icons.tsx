import { FC } from 'react';

export const GamesLogo: FC = () => {
  return (
    <div className="text-accent font-game text-xl mr-2">
      Game<span className="text-primary">Vault</span>
    </div>
  );
};

export const GameControllerIcon: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <circle cx="16" cy="12" r="1" />
      <circle cx="18" cy="10" r="1" />
      <circle cx="14" cy="10" r="1" />
      <circle cx="16" cy="8" r="1" />
    </svg>
  );
};

export const StarIcon: FC<{ filled?: boolean }> = ({ filled = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};
