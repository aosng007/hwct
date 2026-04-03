import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
  Dot,
} from 'recharts';
import type { SheetRow } from '../lib/api';
import { getBmiZone, BMI_ZONE_COLORS } from '../lib/bmi';

interface Props {
  rows: SheetRow[];
}

interface ChartPoint {
  date: string;
  bmi: number;
  weight: number;
  height: number;
  zone: string;
  fill: string;
}

// Recharts custom dot colored by zone
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BmiDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={5}
      fill={payload.fill}
      stroke="#fff"
      strokeWidth={2}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartPoint;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm space-y-1">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-gray-600">
        BMI: <span className="font-bold">{d.bmi.toFixed(1)}</span>
      </p>
      <p className="text-gray-600">Weight: {d.weight} kg</p>
      <p className="text-gray-600">Height: {d.height} cm</p>
      <p
        className="text-xs font-medium capitalize"
        style={{ color: d.fill }}
      >
        {d.zone}
      </p>
    </div>
  );
}

// BMI zones with their upper limit for the chart Y domain
const ZONES = [
  { key: 'underweight', label: 'Underweight', y1: 10, y2: 18.5, color: BMI_ZONE_COLORS.underweight },
  { key: 'normal', label: 'Normal', y1: 18.5, y2: 25, color: BMI_ZONE_COLORS.normal },
  { key: 'overweight', label: 'Overweight', y1: 25, y2: 30, color: BMI_ZONE_COLORS.overweight },
  { key: 'obese', label: 'Obese', y1: 30, y2: 50, color: BMI_ZONE_COLORS.obese },
];

export default function BmiChart({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center h-64 text-gray-400 text-sm">
        No data yet. Add your first entry!
      </div>
    );
  }

  const data: ChartPoint[] = rows.map((r) => {
    const zone = getBmiZone(r.bmi);
    return { ...r, zone, fill: BMI_ZONE_COLORS[zone] };
  });

  const allBmi = data.map((d) => d.bmi);
  const minBmi = Math.max(10, Math.floor(Math.min(...allBmi)) - 2);
  const maxBmi = Math.min(50, Math.ceil(Math.max(...allBmi)) + 2);

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">BMI Trend</h2>

      {/* Zone legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {ZONES.map((z) => (
          <span key={z.key} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: z.color }}
            />
            {z.label}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          {/* BMI zone background bands */}
          {ZONES.map((z) => (
            <ReferenceArea
              key={z.key}
              yAxisId="bmi"
              y1={Math.max(z.y1, minBmi)}
              y2={Math.min(z.y2, maxBmi)}
              fill={z.color}
              fillOpacity={0.25}
              ifOverflow="visible"
            />
          ))}

          {/* Zone boundary lines */}
          {[18.5, 25, 30].map((v) =>
            v >= minBmi && v <= maxBmi ? (
              <ReferenceLine
                key={v}
                yAxisId="bmi"
                y={v}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            ) : null
          )}

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            yAxisId="bmi"
            domain={[minBmi, maxBmi]}
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: 'BMI', angle: -90, position: 'insideLeft', offset: 8, style: { fontSize: 11 } }}
          />
          <YAxis
            yAxisId="weight"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: 'kg', angle: 90, position: 'insideRight', offset: 8, style: { fontSize: 11 } }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          {/* BMI line */}
          <Line
            yAxisId="bmi"
            type="monotone"
            dataKey="bmi"
            name="BMI"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<BmiDot />}
            activeDot={{ r: 7 }}
          />

          {/* Weight line (secondary) */}
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            name="Weight (kg)"
            stroke="#a78bfa"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
