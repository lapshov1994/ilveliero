import React, { createContext, useContext, useState } from 'react';

interface NavContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const NavContext = createContext<NavContextType>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <NavContext.Provider value={{
      isOpen,
      toggle: () => setIsOpen(v => !v),
      close: () => setIsOpen(false),
    }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);
