import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Studio } from '../api/types';
import * as studiosApi from '../api/studios';
import { getStudioId, setStudioId as saveStudioId } from '../utils/storage';
import { useAuth } from './AuthContext';

interface StudioContextType {
  studioId: number | null;
  studios: Studio[];
  currentStudio: Studio | null;
  isLoading: boolean;
  setStudioId: (id: number) => Promise<void>;
  refreshStudios: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [studioId, setStudioIdState] = useState<number | null>(null);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Portováno z common.js → autoSelectStudio()
  const autoSelectStudio = useCallback(async () => {
    setIsLoading(true);
    try {
      // Načti uložené studio ID
      const savedId = await getStudioId();

      // Načti dostupná studia
      const allStudios = await studiosApi.getStudios();
      setStudios(allStudios);

      if (savedId && allStudios.some(s => s.id === savedId)) {
        setStudioIdState(savedId);
        setIsLoading(false);
        return;
      }

      // Zkus najít studia s aktivními permanentkami
      try {
        const active = await studiosApi.getMyActiveStudios();
        if (active.length > 0) {
          await saveStudioId(active[0].id);
          setStudioIdState(active[0].id);
          setIsLoading(false);
          return;
        }
      } catch {}

      // Fallback: první dostupné
      if (allStudios.length > 0) {
        await saveStudioId(allStudios[0].id);
        setStudioIdState(allStudios[0].id);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      autoSelectStudio();
    } else {
      setStudioIdState(null);
      setStudios([]);
      setIsLoading(false);
    }
  }, [isLoggedIn, autoSelectStudio]);

  const setStudioId = useCallback(async (id: number) => {
    await saveStudioId(id);
    setStudioIdState(id);
  }, []);

  const currentStudio = studios.find(s => s.id === studioId) || null;

  return (
    <StudioContext.Provider value={{
      studioId,
      studios,
      currentStudio,
      isLoading,
      setStudioId,
      refreshStudios: autoSelectStudio,
    }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioContextType {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within StudioProvider');
  return ctx;
}
