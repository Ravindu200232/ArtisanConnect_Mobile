import { useEffect } from 'react';

export const useNotificationSound = () => {
  useEffect(() => {
    // Preload notification sound
    const audio = new Audio('https://notificationsounds.com/soundfiles/9b8619251a19057cff70779273e95aa6/file-sounds-1150-pristine.mp3');
    audio.load();
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio('https://notificationsounds.com/soundfiles/9b8619251a19057cff70779273e95aa6/file-sounds-1150-pristine.mp3');
    audio.play().catch(err => console.log('Sound play failed:', err));
  };

  return { playNotificationSound };
};