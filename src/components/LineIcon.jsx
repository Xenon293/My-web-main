const paths = {
  about: <><circle cx="12" cy="8" r="3.25" /><path d="M5.5 20c.45-4.25 2.7-6.25 6.5-6.25s6.05 2 6.5 6.25" /></>,
  projects: <><rect x="3.5" y="4" width="7" height="6.5" rx="1.25" /><rect x="13.5" y="4" width="7" height="6.5" rx="1.25" /><rect x="3.5" y="13.5" width="7" height="6.5" rx="1.25" /><rect x="13.5" y="13.5" width="7" height="6.5" rx="1.25" /></>,
  resources: <><path d="M4.25 5.5A2.5 2.5 0 0 1 6.75 3H11v16.5H6.75a2.5 2.5 0 0 0-2.5 1.5V5.5Z" /><path d="M19.75 5.5A2.5 2.5 0 0 0 17.25 3H13v16.5h4.25a2.5 2.5 0 0 1 2.5 1.5V5.5Z" /></>,
  contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  buddy: <><path d="M12 3.5a6.5 6.5 0 0 0-4.8 10.88L6.5 19l4.55-1.15A6.5 6.5 0 1 0 12 3.5Z" /><path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" /></>,
  typing: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7.5 14h9" /></>,
  github: <><path d="M15.5 21v-3.5c0-1 .1-1.4-.5-2 2.75-.3 5.65-1.35 5.65-6.1A4.8 4.8 0 0 0 19.4 6c.12-.32.55-1.62-.12-3.37 0 0-1.03-.33-3.4 1.3a11.8 11.8 0 0 0-6.2 0c-2.35-1.63-3.4-1.3-3.4-1.3C5.6 4.38 6.03 5.68 6.15 6A4.8 4.8 0 0 0 4.9 9.4c0 4.73 2.9 5.8 5.65 6.1-.45.4-.68.9-.75 1.52-.68.3-2.4.82-3.45-1 0 0-.62-1.15-1.82-1.23" /><path d="M8.5 21h7" /></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.4 6.6h.01" /></>,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></>,
  moon: <path d="M20 15.25A8.5 8.5 0 0 1 8.75 4a8.5 8.5 0 1 0 11.25 11.25Z" />,
  volume: <><path d="M5 10v4h3l4 3V7l-4 3H5Z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  volumeOff: <><path d="M5 10v4h3l4 3V7l-4 3H5Z" /><path d="m16 10 5 5M21 10l-5 5" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
};

export function LineIcon({ name, size = 18, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`line-icon ${className}`}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6">
        {paths[name]}
      </g>
    </svg>
  );
}
