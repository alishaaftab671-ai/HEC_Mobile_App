import { createContext, useContext } from 'react';

type SidebarContextValue = {
  openSidebar: () => void;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used inside SidebarContext.Provider');
  return context;
}
