export interface SheetRow {
  date: string;       // YYYY-MM-DD
  height: number;     // cm
  weight: number;     // kg
  bmi: number;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
}

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

export async function fetchRows(token: string): Promise<SheetRow[]> {
  if (!APPS_SCRIPT_URL) throw new Error('VITE_APPS_SCRIPT_URL is not set');

  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('authorization', token);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const data: unknown = await res.json();

  if (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    'error' in data &&
    typeof (data as ApiResponse).error === 'string' &&
    (data as ApiResponse).error!.length > 0
  ) {
    throw new Error(`Failed to fetch data: ${(data as ApiResponse).error}`);
  }

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response format from server');
  }

  return (data as unknown[]).filter(
    (item): item is SheetRow =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as SheetRow).date === 'string' &&
      typeof (item as SheetRow).height === 'number' &&
      typeof (item as SheetRow).weight === 'number' &&
      typeof (item as SheetRow).bmi === 'number'
  );
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

  const responseText = await res.text();
  if (!responseText) return;

  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch {
    return;
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiResponse).error === 'string' &&
    (data as ApiResponse).error!.length > 0
  ) {
    throw new Error(`Failed to save data: ${(data as ApiResponse).error}`);
  }
}

