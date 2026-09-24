export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="16" fill="#0a3b48" />
      <path
        d="M8 26c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
        fill="none"
        stroke="#7fe3dd"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8 40c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8 54c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
        fill="none"
        stroke="#ffd23a"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
