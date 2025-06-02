import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SystemSettingsContext = createContext({ showPlansSection: true });

export const SystemSettingsProvider = ({ children }) => {
  const [showPlansSection, setShowPlansSection] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('system_settings').select('show_plans_section').single();
      if (!error && data) setShowPlansSection(!!data.show_plans_section);
      else setShowPlansSection(false);
    };
    fetchSettings();
  }, []);

  return (
    <SystemSettingsContext.Provider value={{ showPlansSection }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => useContext(SystemSettingsContext); 