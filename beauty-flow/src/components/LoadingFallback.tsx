import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F1419]">
      <div className="size-8 rounded-full border-2 border-gray-200 border-t-orange-500 animate-spin dark:border-gray-800 dark:border-t-orange-400" role="status" aria-label={t('common.loading')} />
    </div>
  );
};

export default LoadingFallback;
