import {useTranslation} from 'react-i18next';
import {SunIcon, MoonIcon} from '@heroicons/react/24/outline';
import {Switch} from '@/components/ui/switch';
import {useTheme} from '@/context/ThemeContext';

export function ThemeToggle() {
  const {t} = useTranslation();
  const {resolvedTheme, setTheme} = useTheme();

  const isDark = resolvedTheme === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center gap-2">
      <SunIcon className="size-4 text-amber-500" />
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        aria-label={t('common.toggleTheme')}
      />
      <MoonIcon className="size-4 text-slate-400 dark:text-slate-300" />
    </div>
  );
}
