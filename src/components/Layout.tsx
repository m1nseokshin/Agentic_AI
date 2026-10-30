import { Link, NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '공모 안내' },
  { to: '/apply', label: '응모하기' },
  { to: '/status', label: '접수 현황' },
]

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            AI 아이디어 공모전
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'bg-muted text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-xs text-muted-foreground">
          AI가 붙이는 분야·평점·심사평은 검토 초안이며, 최종 심사는 사람이 합니다.
        </div>
      </footer>
    </div>
  )
}
