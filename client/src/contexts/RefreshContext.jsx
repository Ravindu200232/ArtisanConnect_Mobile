// contexts/RefreshContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const RefreshContext = createContext();

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

export const RefreshProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshTrigger }}>
      {children}
    </RefreshContext.Provider>
  );
};