export interface SheetRow {
  date: string;       // YYYY-MM-DD
  height: number;     // cm
  weight: number;     // kg
  bmi: number;
}

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

export async function fetchRows(token: string): Promise<SheetRow[]> {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not set');

  const res = await fetch(APPS_SCRIPT_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data as SheetRow[];
}

export async function appendRow(token: string, row: SheetRow): Promise<void> {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not set');

  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    throw new Error(`Failed to save data: ${res.status} ${res.statusText}`);
  }
}
