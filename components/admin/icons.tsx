/** Ícones do painel: um traço só (1.6), 20 px, cor herdada. */

function Icon({ children, className = "h-5 w-5" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`flex-none ${className}`}
    >
      {children}
    </svg>
  );
}

type Props = { className?: string };

export const IconChart = (p: Props) => (
  <Icon {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icon>
);
export const IconInbox = (p: Props) => (
  <Icon {...p}>
    <path d="M3 13h5l1.5 3h5L16 13h5" />
    <path d="M5.5 5h13L21 13v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z" />
  </Icon>
);
export const IconUsers = (p: Props) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.900 2.100 6.500 5.500M16 4.700a3.500 3.500 0 0 1 0 6.600M18.500 14.900c1.600.800 2.700 2.500 3 5.100" />
  </Icon>
);
export const IconPen = (p: Props) => (
  <Icon {...p}>
    <path d="M4 20h4L19.500 8.500a2.100 2.100 0 0 0-3-3L5 17z" />
    <path d="m14.500 7.500 3 3" />
  </Icon>
);
export const IconOut = (p: Props) => (
  <Icon {...p}>
    <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h9" />
  </Icon>
);
export const IconExternal = (p: Props) => (
  <Icon {...p}>
    <path d="M14 5h5v5M19 5l-8 8M11 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5" />
  </Icon>
);
export const IconArrowUp = (p: Props) => (
  <Icon {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
);
export const IconArrowDown = (p: Props) => (
  <Icon {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Icon>
);
export const IconEye = (p: Props) => (
  <Icon {...p}>
    <path d="M2 12s3.600-6.500 10-6.500S22 12 22 12s-3.600 6.500-10 6.500S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.700" />
  </Icon>
);
export const IconEyeOff = (p: Props) => (
  <Icon {...p}>
    <path d="M4 4l16 16M9.900 5.800A9.700 9.700 0 0 1 12 5.500c6.400 0 10 6.500 10 6.500a17 17 0 0 1-3.300 3.900M6.200 7.300A17 17 0 0 0 2 12s3.600 6.500 10 6.500a9.500 9.500 0 0 0 4-.900M9.900 10a2.700 2.700 0 0 0 3.900 3.900" />
  </Icon>
);
export const IconCursor =(p: Props) => (
  <Icon {...p}>
    <path d="m5 4 5.500 15 2.300-6.200L19 10.500z" />
  </Icon>
);
export const IconClock = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.500" />
    <path d="M12 7.500V12l3 2" />
  </Icon>
);
export const IconForm = (p: Props) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 9h8M8 13h8M8 17h4" />
  </Icon>
);
export const IconCheck = (p: Props) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
export const IconPlay = (p: Props) => (
  <Icon {...p}>
    <path d="M7 5v14l12-7z" />
  </Icon>
);
export const IconPlus = (p: Props) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const IconBack = (p: Props) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const IconUser = (p: Props) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.8-4 3.900-6 8-6s7.200 2 8 6" />
  </Icon>
);
export const IconMenu = (p: Props) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const IconRetry = (p: Props) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 1 0-2.300 5.700M20 5v6h-6" />
  </Icon>
);
export const IconClose = (p: Props) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const IconDownload = (p: Props) => (
  <Icon {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M4 20h16" />
  </Icon>
);
export const IconSearch = (p: Props) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.5-4.5" />
  </Icon>
);
