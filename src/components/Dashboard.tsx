import { useAuth } from '../contexts/AuthContext';
import { useSheetData } from '../hooks/useSheetData';
import EntryForm from './EntryForm';
import BmiChart from './BmiChart';
import type { SheetRow } from '../lib/api';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { rows, loading, error, addRow } = useSheetData();

  const handleAddRow = async (row: SheetRow) => {
    await addRow(row);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          <span className="font-semibold text-gray-800">ScaleLog</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
            </div>
          )}
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry form */}
          <div className="lg:col-span-1">
            <EntryForm onSubmit={handleAddRow} />
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center h-64 text-gray-400 text-sm">
                Loading…
              </div>
            ) : (
              <BmiChart rows={rows} />
            )}
          </div>
        </div>

        {/* History table */}
        {rows.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">History</h2>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Height (cm)</th>
                  <th className="pb-2 pr-4 font-medium">Weight (kg)</th>
                  <th className="pb-2 font-medium">BMI</th>
                </tr>
              </thead>
              <tbody>
                {[...rows].reverse().map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-4 text-gray-700">{row.date}</td>
                    <td className="py-2 pr-4 text-gray-700">{row.height}</td>
                    <td className="py-2 pr-4 text-gray-700">{row.weight}</td>
                    <td className="py-2 text-gray-700 font-medium">{row.bmi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
