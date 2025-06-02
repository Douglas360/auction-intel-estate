
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyTypeStat {
  type: string;
  count: number;
}

export const usePropertyTypeStats = () => {
  const [stats, setStats] = useState<PropertyTypeStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('type')
          .not('type', 'is', null);

        if (error) {
          console.error('Error fetching property stats:', error);
          return;
        }

        // Count occurrences of each type
        const typeCounts = data.reduce((acc, property) => {
          const type = property.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to array format
        const statsArray = Object.entries(typeCounts).map(([type, count]) => ({
          type,
          count
        }));

        setStats(statsArray);
      } catch (error) {
        console.error('Error fetching property stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};
