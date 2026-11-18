import type { ReactNode, SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function makeIcon(paths: ReactChildrenFactory) {
  return function IconComponent({ size = 18, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {paths()}
      </svg>
    )
  }
}

type ReactChildrenFactory = () => ReactNode

export const Info = makeIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16.5" />
    <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
  </>
))

export const CheckCircle2 = makeIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.2l2.4 2.4 4.6-5.2" />
  </>
))

export const AlertTriangle = makeIcon(() => (
  <>
    <path d="M12 3.5l9.5 16.5h-19z" />
    <line x1="12" y1="9.5" x2="12" y2="14" />
    <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
  </>
))

export const XCircle = makeIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </>
))

export const Search = makeIcon(() => (
  <>
    <circle cx="11" cy="11" r="6.5" />
    <line x1="20" y1="20" x2="15.8" y2="15.8" />
  </>
))

export const Bell = makeIcon(() => (
  <>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>
))

export const UserIcon = makeIcon(() => (
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6" />
  </>
))

export const LogOut = makeIcon(() => (
  <>
    <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
    <line x1="20" y1="12" x2="10.5" y2="12" />
    <path d="M16.5 8l3.5 4-3.5 4" />
  </>
))

export const ChevronDown = makeIcon(() => <path d="M5.5 8.5l6.5 7 6.5-7" />)

export const Menu = makeIcon(() => (
  <>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </>
))

export const Ticket = makeIcon(() => (
  <>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v1.75a1.75 1.75 0 0 0 0 3.5V15.5A1.5 1.5 0 0 1 18.5 17h-13A1.5 1.5 0 0 1 4 15.5v-1.75a1.75 1.75 0 0 0 0-3.5z" />
    <line x1="14" y1="7.5" x2="14" y2="16.5" strokeDasharray="2 2" />
  </>
))

export const FileText = makeIcon(() => (
  <>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5z" />
    <path d="M14 3.5V8h4.5" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="15.5" x2="15" y2="15.5" />
  </>
))

export const Users = makeIcon(() => (
  <>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.7-3 3-4.7 5.5-4.7s4.8 1.7 5.5 4.7" />
    <path d="M15.5 6a3 3 0 0 1 0 5.8" />
    <path d="M17.5 14.7c2 .4 3.4 1.9 4 4.3" />
  </>
))

export const ScrollText = makeIcon(() => (
  <>
    <path d="M6 4h11a2 2 0 0 1 2 2v11a2.5 2.5 0 0 1-2.5 2.5H8" />
    <path d="M6 4a2 2 0 0 0-2 2v10.5A2.5 2.5 0 0 0 6.5 19H8V6a2 2 0 0 0-2-2z" />
    <line x1="9.5" y1="8" x2="15" y2="8" />
    <line x1="9.5" y1="11.2" x2="15" y2="11.2" />
  </>
))

export const LayoutDashboard = makeIcon(() => (
  <>
    <rect x="4" y="4" width="7" height="9" rx="1.3" />
    <rect x="13" y="4" width="7" height="5.5" rx="1.3" />
    <rect x="13" y="12" width="7" height="8" rx="1.3" />
    <rect x="4" y="15.5" width="7" height="4.5" rx="1.3" />
  </>
))

export const Settings = makeIcon(() => (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18 6l-1.5 1.5M7.5 16.5L6 18M18 18l-1.5-1.5M7.5 7.5L6 6" />
  </>
))

export const MessageSquare = makeIcon(() => (
  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5z" />
))

export const ShieldCheck = makeIcon(() => (
  <>
    <path d="M12 3l7 3v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4.5" />
  </>
))

export const ShieldAlert = makeIcon(() => (
  <>
    <path d="M12 3l7 3v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" />
    <line x1="12" y1="8.5" x2="12" y2="12.5" />
    <circle cx="12" cy="15.2" r="0.6" fill="currentColor" stroke="none" />
  </>
))

export const Bug = makeIcon(() => (
  <>
    <rect x="8" y="8" width="8" height="9.5" rx="4" />
    <line x1="12" y1="4" x2="12" y2="8" />
    <line x1="5" y1="10" x2="8" y2="11.3" />
    <line x1="5" y1="15" x2="8" y2="14" />
    <line x1="19" y1="10" x2="16" y2="11.3" />
    <line x1="19" y1="15" x2="16" y2="14" />
    <path d="M9.5 4.5c.7-1 3.3-1 4 0" />
  </>
))

export const Trophy = makeIcon(() => (
  <>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5.5H4.5A2.5 2.5 0 0 0 6.5 9.5" />
    <path d="M17 5.5h2.5A2.5 2.5 0 0 1 17.5 9.5" />
    <line x1="12" y1="14" x2="12" y2="17.5" />
    <path d="M8.5 20h7l-1-2.5h-5z" />
  </>
))

export const ArrowRight = makeIcon(() => (
  <>
    <line x1="4.5" y1="12" x2="19" y2="12" />
    <path d="M13.5 6.5L19 12l-5.5 5.5" />
  </>
))

export const Play = makeIcon(() => <path d="M8 5.5l11 6.5-11 6.5z" />)

export const Discord = makeIcon(() => (
  <>
    <path d="M8.5 9.2c-2 .5-3.2 1.8-3.6 4.7-.3 2.2.2 3.7 1.4 4.6 1 .8 2.3 1.1 3.6.9l.6-1.4" />
    <path d="M15.5 9.2c2 .5 3.2 1.8 3.6 4.7.3 2.2-.2 3.7-1.4 4.6-1 .8-2.3 1.1-3.6.9l-.6-1.4" />
    <path d="M8.5 9.2C10 8.6 11 8.4 12 8.4s2 .2 3.5.8" />
    <circle cx="9.6" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.4" cy="13.2" r="1.1" fill="currentColor" stroke="none" />
  </>
))

export const MapPin = makeIcon(() => (
  <>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.2" />
  </>
))

export const Clock = makeIcon(() => (
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </>
))

export const Star = makeIcon(() => <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" />)

export const ExternalLink = makeIcon(() => (
  <>
    <path d="M9.5 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5v-4" />
    <path d="M14 4h6v6" />
    <line x1="20" y1="4" x2="11" y2="13" />
  </>
))

export const ChevronRight = makeIcon(() => <path d="M8.5 5.5l7 6.5-7 6.5" />)

export const X = makeIcon(() => (
  <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </>
))

export const Building2 = makeIcon(() => (
  <>
    <rect x="4" y="9" width="8" height="11" rx="0.8" />
    <rect x="12.5" y="4" width="7.5" height="16" rx="0.8" />
    <line x1="6.5" y1="12" x2="6.5" y2="12.01" />
    <line x1="9" y1="12" x2="9" y2="12.01" />
    <line x1="6.5" y1="15" x2="6.5" y2="15.01" />
    <line x1="9" y1="15" x2="9" y2="15.01" />
    <line x1="15.2" y1="8" x2="15.2" y2="8.01" />
    <line x1="17.8" y1="8" x2="17.8" y2="8.01" />
    <line x1="15.2" y1="11" x2="15.2" y2="11.01" />
    <line x1="17.8" y1="11" x2="17.8" y2="11.01" />
  </>
))