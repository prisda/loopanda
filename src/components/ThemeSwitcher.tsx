import { Menu } from '@headlessui/react';
import { Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { clsx } from 'clsx';

const THEMES = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'cupcake', label: 'Cupcake' },
  { name: 'bumblebee', label: 'Bumblebee' },
  { name: 'emerald', label: 'Emerald' },
  { name: 'corporate', label: 'Corporate' },
  { name: 'synthwave', label: 'Synthwave' },
  { name: 'retro', label: 'Retro' },
  { name: 'cyberpunk', label: 'Cyberpunk' },
  { name: 'valentine', label: 'Valentine' },
  { name: 'halloween', label: 'Halloween' },
  { name: 'garden', label: 'Garden' },
  { name: 'forest', label: 'Forest' },
  { name: 'aqua', label: 'Aqua' },
  { name: 'lofi', label: 'Lo-Fi' },
  { name: 'pastel', label: 'Pastel' },
  { name: 'fantasy', label: 'Fantasy' },
  { name: 'wireframe', label: 'Wireframe' },
  { name: 'black', label: 'Black' },
  { name: 'luxury', label: 'Luxury' },
  { name: 'dracula', label: 'Dracula' },
  { name: 'cmyk', label: 'CMYK' },
  { name: 'autumn', label: 'Autumn' },
  { name: 'business', label: 'Business' },
  { name: 'acid', label: 'Acid' },
  { name: 'lemonade', label: 'Lemonade' },
  { name: 'night', label: 'Night' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'winter', label: 'Winter' }
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
        <Palette className="w-5 h-5" />
        <span className="hidden md:inline">Theme</span>
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
        {THEMES.map(({ name, label }) => (
          <Menu.Item key={name}>
            {({ active }) => (
              <button
                onClick={() => setTheme(name)}
                className={clsx(
                  'flex items-center w-full px-4 py-2 text-sm',
                  active ? 'bg-gray-100' : '',
                  theme === name ? 'text-brand font-medium' : 'text-gray-700'
                )}
              >
                <div className="w-4 h-4 rounded-full border border-gray-300 mr-3">
                  {theme === name && (
                    <div className="w-full h-full rounded-full bg-brand" />
                  )}
                </div>
                {label}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}