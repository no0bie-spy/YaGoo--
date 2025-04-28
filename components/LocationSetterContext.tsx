import React, { createContext, useContext, useState } from 'react';

type Setter = (location: { address: string; coordinates: any }) => void;

const SetterContext = createContext<{
  setSetter: (fn: Setter | null) => void;
  setter: Setter | null;
}>({ setSetter: () => {}, setter: null });

export const LocationSetterProvider = ({ children }: { children: React.ReactNode }) => {
  const [setter, setSetter] = useState<Setter | null>(null);
  return (
    <SetterContext.Provider value={{ setter, setSetter }}>
      {children}
    </SetterContext.Provider>
  );
};

export const useLocationSetter = () => useContext(SetterContext);
