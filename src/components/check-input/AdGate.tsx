import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {motion, AnimatePresence} from 'motion/react';
import {CameraIcon, ArrowPathIcon} from '@heroicons/react/24/outline';

declare global {
  function adBreak(options: {
    type: 'reward';
    name: string;
    beforeReward(showAdFn: () => void): void;
    adViewed(): void;
    adDismissed(): void;
    adBreakDone(info: {breakStatus: string}): void;
  }): void;
}

type UiState = 'idle' | 'loading' | 'dismissed' | 'unavailable';

interface AdGateProps {
  onAdWatched: () => void;
  onClose: () => void;
}

export function AdGate({onAdWatched, onClose}: AdGateProps) {
  const {t} = useTranslation();
  const [uiState, setUiState] = useState<UiState>('idle');

  const handleWatchAd = () => {
    setUiState('loading');

    if (typeof adBreak === 'undefined') {
      setUiState('unavailable');
      return;
    }

    adBreak({
      type: 'reward',
      name: 'scanner-unlock',
      beforeReward(showAdFn) {
        showAdFn();
      },
      adViewed() {
        onAdWatched();
      },
      adDismissed() {
        setUiState('dismissed');
      },
      adBreakDone(info) {
        if (
          info.breakStatus === 'notReady' ||
          info.breakStatus === 'timeout' ||
          info.breakStatus === 'error'
        ) {
          setUiState('unavailable');
        }
      },
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{scale: 0.9, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          exit={{scale: 0.9, opacity: 0}}
          transition={{type: 'spring', duration: 0.3}}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4">
              <CameraIcon className="size-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('adGate.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {t('adGate.description')}
          </p>

          {uiState === 'idle' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleWatchAd}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
              >
                {t('adGate.watchButton')}
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm py-2 transition-colors"
              >
                {t('adGate.cancel')}
              </button>
            </div>
          )}

          {uiState === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{rotate: 360}}
                transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
              >
                <ArrowPathIcon className="size-8 text-primary-600" />
              </motion.div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('adGate.loading')}
              </p>
            </div>
          )}

          {uiState === 'dismissed' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                {t('adGate.dismissed')}
              </p>
              <button
                onClick={handleWatchAd}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
              >
                {t('adGate.tryAgain')}
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm py-2 transition-colors"
              >
                {t('adGate.cancel')}
              </button>
            </div>
          )}

          {uiState === 'unavailable' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {t('adGate.unavailable')}
              </p>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-6 rounded-lg transition-colors"
              >
                {t('adGate.cancel')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
