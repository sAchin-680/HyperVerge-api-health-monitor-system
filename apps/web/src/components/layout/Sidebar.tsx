'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Plus, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/monitors', label: 'Monitors', icon: Activity },
  { href: '/monitors/new', label: 'New Monitor', icon: Plus },
  { href: '/status', label: 'Status Page', icon: Globe },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-white/[0.06] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              API Health
            </span>
            <span className="block text-xs text-blue-400/80 font-medium">
              Monitor System
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-4">
          Navigation
        </p>
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent text-white border-l-2 border-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-12px_rgba(59,130,246,0.3)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white hover:translate-x-1'
              )}
            >
              <link.icon
                className={cn(
                  'w-[18px] h-[18px] transition-all duration-300',
                  isActive
                    ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                    : 'text-slate-500 group-hover:text-blue-400'
                )}
              />
              {link.label}
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="p-3 rounded-xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/[0.04]">
          <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
            API Health Monitor
          </p>
          <p className="text-xs text-slate-400 mt-1">DevOps Internship 2026</p>
        </div>
      </div>
    </aside>
  );
}
