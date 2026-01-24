import {useTranslation} from 'react-i18next';

export function Footer() {
  const {t} = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>{t('footer.builtWith')}</p>
      </div>
    </footer>
  );
}
