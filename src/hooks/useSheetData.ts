import { useState, useEffect, useCallback } from 'react';
import { fetchRows, appendRow, type SheetRow } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function useSheetData() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRows(user.accessToken);
      const sorted = [...data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setRows(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addRow = useCallback(
    async (row: SheetRow) => {
      if (!user) return;
      await appendRow(user.accessToken, row);
      await load();
    },
    [user, load]
  );

  return { rows, loading, error, reload: load, addRow };
}
