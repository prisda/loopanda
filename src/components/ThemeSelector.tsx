import { useEffect, useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  value: string;
  onChange: (theme: string) => void;
}

const THEMES = [
  { name: 'light', colors: { primary: '#3B82F6', secondary: '#6B7280', accent: '#10B981' } },
  { name: 'dark', colors: { primary: '#60A5FA', secondary: '#9CA3AF', accent: '#34D399' } },
  { name: 'system', colors: { primary: '#3B82F6', secondary: '#6B7280', accent: '#10B981' } }
] as const;

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const { currentProject } = useProject();
  const [previewTheme, setPreviewTheme] = useState(value);

  useEffect(() => {
    if (currentProject?.settings?.theme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(currentProject.settings.theme);
    }
  }, [currentProject?.settings?.theme]);

  const handlePreview = (theme: string) => {
    setPreviewTheme(theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  };

  const handlePreviewEnd = () => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-4">
          {THEMES.map(theme => (
            <button
              key={theme.name}
              onClick={() => onChange(theme.name)}
              onMouseEnter={() => handlePreview(theme.name)}
              onMouseLeave={handlePreviewEnd}
              className={`relative p-4 rounded-lg border transition-all ${
                value === theme.name
                  ? 'border-brand shadow-md'
                  : 'border-gray-200 hover:border-brand/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {theme.name}
                  </span>
                  {value === theme.name && (
                    <Check className="w-4 h-4 text-brand" />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1">
                  <div 
                    className="h-6 rounded" 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="h-6 rounded"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Theme Preview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90">
              Primary Button
            </button>
            <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Secondary Button
            </button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">Info Alert</div>
            <div className="p-3 bg-green-100 text-green-800 rounded-lg">Success Alert</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Select a theme to customize the look and feel of your project. 
        Hover over a theme to preview it.
      </p>
    </div>
  );
}