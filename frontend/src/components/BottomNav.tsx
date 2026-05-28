// Barra de navegación inferior con iconos SVG propios.
// Diseño mobile-first: fixed bottom, respeta safe-area-inset en iOS/Android.

interface NavItem {
  value: string
  label: string
  icon: (active: boolean) => JSX.Element
  badge?: number
}

interface Props {
  items: NavItem[]
  active: string
  onChange: (v: string) => void
}

export default function BottomNav({ items, active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 bg-uvg-surface border-t border-uvg-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex h-14">
        {items.map(item => {
          const isActive = item.value === active
          return (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5
                transition-colors duration-150
                ${isActive ? 'text-uvg-green' : 'text-uvg-muted'}`}
            >
              {/* Icono con badge opcional */}
              <span className="relative">
                {item.icon(isActive)}
                {item.badge != null && item.badge > 0 && (
                  <span className="
                    absolute -top-1 -right-1.5
                    min-w-[14px] h-[14px] px-[3px]
                    bg-uvg-green text-white rounded-full
                    text-[9px] font-bold leading-[14px] text-center
                  ">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>

              {/* Label */}
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ── Iconos SVG (stroke 1.5 inactivo, 2 activo) ───────────────────────────────
// Exportados para usarlos en los dashboards.

export function IconSearch(active: boolean) {
  const w = active ? '2' : '1.5'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7.5" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export function IconBookmark(active: boolean) {
  const w = active ? '2' : '1.5'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function IconPerson(active: boolean) {
  const w = active ? '2' : '1.5'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" fill={active ? 'currentColor' : 'none'} />
      <path d="M4 21c0-4.418 3.582-7 8-7s8 2.582 8 7" />
    </svg>
  )
}

export function IconCalendar(active: boolean) {
  const w = active ? '2' : '1.5'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"
        fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.08 : 0} />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function IconStar(active: boolean) {
  const w = active ? '2' : '1.5'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconInbox(active: boolean) {
  const w = active ? '2' : '1.5'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
        fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.08 : 0} />
    </svg>
  )
}
