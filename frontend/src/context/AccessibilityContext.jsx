import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('md'); // sm, md, lg
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    document.documentElement.classList.add(`font-size-${fontSize}`);

    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontSize, highContrast]);

  const cycleFontSize = () => {
    if (fontSize === 'sm') setFontSize('md');
    else if (fontSize === 'md') setFontSize('lg');
    else setFontSize('sm');
  };

  return (
    <AccessibilityContext.Provider value={{ fontSize, setFontSize, cycleFontSize, highContrast, setHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
