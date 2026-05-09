import { NavLink, useNavigate } from 'react-router-dom';
import { Users, HelpCircle, Type, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const ITEMS = [
  { to: '/admin/types',      label: 'タイプ説明', icon: Users },
  { to: '/admin/questions',  label: '問題',       icon: HelpCircle },
  { to: '/admin/ui-strings', label: 'UI文言',     icon: Type },
];

export function AdminSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login', { replace: true });
  };

  return (
    <nav className="w-56 border-r border-stone-200 bg-stone-50/50 flex flex-col">
      <div className="p-4 space-y-1 flex-1">
        <div className="px-3 py-2 mb-2">
          <div className="font-serif text-stone-900">Animalume</div>
          <div className="text-[10px] uppercase tracking-wider text-stone-400 mt-0.5">
            Admin
          </div>
        </div>
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition',
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {user && !user.isAnonymous && (
        <div className="border-t border-stone-200 p-3 space-y-2">
          <div
            className="px-2 text-[11px] text-stone-500 truncate"
            title={user.email ?? user.uid}
          >
            {user.email ?? user.uid}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-stone-600 hover:bg-stone-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ログアウト</span>
          </button>
        </div>
      )}
    </nav>
  );
}
