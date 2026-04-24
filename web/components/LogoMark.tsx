type Props = {
  size?: number;
  className?: string;
};

export function LogoMark({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 4 L4 20 L17 12 Z" fill="currentColor" />
      <rect x="17" y="4" width="2.5" height="16" rx="0.4" fill="currentColor" />
    </svg>
  );
}
