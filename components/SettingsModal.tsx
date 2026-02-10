import React, { useState, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { X, Sparkles, User, Palette, Cloud, Sun, Moon, Flower2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'sync';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, changeTheme } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('user@nebulla.app');
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'Owner' | 'Member' | 'Guest'>('Guest');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Role detection
        const isOwner = user.email === 'naufalnamikaze175@gmail.com';
        const isGuest = !user || user.is_anonymous;
        const role = isOwner ? 'Owner' : (isGuest ? 'Guest' : 'Member');

        // Display name logic
        const displayName = user.user_metadata?.full_name
          || user.email?.split('@')[0]
          || 'User';

        setUserName(displayName);
        setUserEmail(user.email || '-');
        setUserCreatedAt(user.created_at || null);
        setUserRole(role);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      } else {
        // Guest user
        setUserName('Guest User');
        setUserEmail('-');
        setUserCreatedAt(null);
        setUserRole('Guest');
        setAvatarUrl(null);
      }
    };
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Color schemes for each mode
  const getColorScheme = () => {
    switch (settings.theme) {
      case 'light':
        return {
          bg: 'bg-gray-50/95',
          sidebarBg: 'bg-gray-100/50',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-600',
          cardBg: 'bg-white/80',
          border: 'border-gray-200/60',
          hoverBg: 'hover:bg-gray-200/30',
        };
      case 'dark':
        return {
          bg: 'bg-[#1a1a2e]/95',
          sidebarBg: 'bg-[#16213e]/80',
          textPrimary: 'text-white',
          textSecondary: 'text-gray-400',
          cardBg: 'bg-[#0f3460]/60',
          border: 'border-gray-700/40',
          hoverBg: 'hover:bg-[#16213e]/50',
        };
      case 'sakura':
        return {
          bg: 'bg-pink-50/90',
          sidebarBg: 'bg-pink-100/30',
          textPrimary: 'text-pink-900',
          textSecondary: 'text-pink-600',
          cardBg: 'bg-white/60',
          border: 'border-pink-200/40',
          hoverBg: 'hover:bg-pink-100/20',
        };
      default:
        return {
          bg: 'bg-gray-50/95',
          sidebarBg: 'bg-gray-100/50',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-600',
          cardBg: 'bg-white/80',
          border: 'border-gray-200/60',
          hoverBg: 'hover:bg-gray-200/30',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      {/* Background Blobs (Decoration) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full floating-bubble" />
        <div className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full floating-bubble" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] right-[10%] w-64 h-64 bg-pink-400/15 blur-[90px] rounded-full floating-bubble" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Glass Container */}
      <div className={`relative w-full max-w-5xl h-[85vh] flex ${colors.bg} backdrop-blur-xl border ${colors.border} rounded-[32px] shadow-2xl overflow-hidden`}>

        {/* Sidebar */}
        <aside className={`w-64 ${colors.sidebarBg} border-r ${colors.border} p-6 flex flex-col gap-2`}>
          {/* Logo/Title */}
          <div className="mb-6">
            <h2 className={`text-xl font-extrabold ${colors.textPrimary} flex items-center gap-2`}>
              <Sparkles size={24} className="text-primary" />
              Settings
            </h2>
            <p className={`text-xs ${colors.textSecondary} mt-1`}>Customize your experience</p>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : `${colors.textSecondary} ${colors.hoverBg}`
              }`}
          >
            <User size={20} />
            <span className="font-semibold">Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'appearance'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : `${colors.textSecondary} ${colors.hoverBg}`
              }`}
          >
            <Palette size={20} />
            <span className="font-semibold">Appearance</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'sync'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : `${colors.textSecondary} ${colors.hoverBg}`
              }`}
          >
            <Cloud size={20} />
            <span className="font-semibold">Sync</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Version Info */}
          <div className={`text-xs ${colors.textSecondary} text-center`}>
            <p>Nebulla v0.9.3</p>
            <p className="mt-1">Made with ❤️</p>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto settings-scrollbar p-10 font-display">
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-6 right-6 p-2 rounded-full ${colors.cardBg} ${colors.hoverBg} transition-all group`}
          >
            <X size={20} className={`${colors.textSecondary} group-hover:rotate-90 transition-transform duration-300`} />
          </button>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h1 className={`text-3xl font-extrabold ${colors.textPrimary} mb-8`}>Profile</h1>

              {/* Profile Card */}
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="size-20 rounded-full bg-gradient-to-tr from-primary to-pink-400 p-1 shadow-lg">
                    <div className={`w-full h-full ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center overflow-hidden`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : userRole === 'Guest' ? (
                        <User size={40} className="text-gray-400" />
                      ) : (
                        <User size={40} className="text-primary" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${colors.textPrimary}`}>{userName}</h3>
                    <p className={`text-sm ${colors.textSecondary}`}>{userEmail}</p>
                  </div>

                  {/* Edit Button */}
                  <button className="px-4 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary font-semibold rounded-xl transition-all">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div className={`${colors.cardBg} backdrop-blur-md border ${colors.border} rounded-2xl p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${colors.textPrimary} mb-4`}>Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={colors.textSecondary}>Member since</span>
                    <span className={`font-semibold ${colors.textPrimary}`}>
                      {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={colors.textSecondary}>Role</span>
                    <span className={`font-semibold ${userRole === 'Owner' ? 'text-amber-500' :
                        userRole === 'Member' ? 'text-blue-500' :
                          'text-gray-400'
                      }`}>{userRole}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h1 className={`text-3xl font-extrabold ${colors.textPrimary} mb-8`}>Appearance</h1>

              {/* Theme Selector */}
              <div className={`${colors.cardBg} backdrop-blur-md border ${colors.border} rounded-2xl p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${colors.textPrimary} mb-4`}>Theme</h3>
                <p className={`text-sm ${colors.textSecondary} mb-6`}>Choose your preferred color scheme</p>

                <div className="grid grid-cols-3 gap-4">
                  {/* Light Theme */}
                  <button
                    onClick={() => changeTheme('light')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${settings.theme === 'light'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : `${colors.border} hover:border-primary/40`
                      }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center shadow-lg">
                      <Sun size={32} className="text-white" />
                    </div>
                    <span className={`font-bold ${colors.textPrimary}`}>Light</span>
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => changeTheme('dark')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${settings.theme === 'dark'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : `${colors.border} hover:border-primary/40`
                      }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                      <Moon size={32} className="text-white" />
                    </div>
                    <span className={`font-bold ${colors.textPrimary}`}>Dark</span>
                  </button>

                  {/* Sakura Theme */}
                  <button
                    onClick={() => changeTheme('sakura')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${settings.theme === 'sakura'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : `${colors.border} hover:border-primary/40`
                      }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-lg">
                      <Flower2 size={32} className="text-white" />
                    </div>
                    <span className={`font-bold ${colors.textPrimary}`}>Sakura</span>
                  </button>
                </div>
              </div>

              {/* Font Preview */}
              <div className={`${colors.cardBg} backdrop-blur-md border ${colors.border} rounded-2xl p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${colors.textPrimary} mb-4`}>Font Preview</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/30 dark:bg-black/20 rounded-xl">
                    <p className={`text-2xl font-bold ${colors.textPrimary}`}>Plus Jakarta Sans</p>
                    <p className={`text-sm ${colors.textSecondary} mt-2`}>
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Tab */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <h1 className={`text-3xl font-extrabold ${colors.textPrimary} mb-8`}>Sync & Storage</h1>

              {/* Sync Status */}
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center size-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${colors.textPrimary}`}>All systems normal</h3>
                      <p className={`text-sm ${colors.textSecondary}`}>Last synced: Just now</p>
                    </div>
                  </div>

                  <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center gap-2 group">
                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    Sync Now
                  </button>
                </div>

                {/* Storage Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${colors.textSecondary}`}>Storage used</span>
                    <span className={`text-sm font-bold ${colors.textPrimary}`}>1.2 GB / 5 GB</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-pink-400 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>

              {/* Cloud Provider */}
              <div className={`${colors.cardBg} backdrop-blur-md border ${colors.border} rounded-2xl p-6 shadow-lg`}>
                <h3 className={`text-lg font-bold ${colors.textPrimary} mb-4`}>Cloud Provider</h3>
                <div className="flex items-center gap-4 p-4 bg-white/30 dark:bg-black/20 rounded-xl">
                  <Cloud size={32} className="text-primary" />
                  <div className="flex-1">
                    <p className={`font-bold ${colors.textPrimary}`}>Supabase</p>
                    <p className={`text-sm ${colors.textSecondary}`}>Connected and syncing</p>
                  </div>
                  <div className="size-3 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsModal;