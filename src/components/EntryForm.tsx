import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { calculateBmi, getBmiZone, BMI_ZONE_COLORS, BMI_ZONE_LABELS } from '../lib/bmi';
import type { SheetRow } from '../lib/api';

interface FormValues {
  date: string;
  height: number;
  weight: number;
}

interface Props {
  onSubmit: (row: SheetRow) => Promise<void>;
}

export default function EntryForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd') },
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const height = watch('height');
  const weight = watch('weight');

  const bmiPreview =
    height > 0 && weight > 0 ? calculateBmi(Number(weight), Number(height)) : null;

  const zone = bmiPreview ? getBmiZone(bmiPreview) : null;

  const handleFormSubmit = async (values: FormValues) => {
    const bmi = calculateBmi(Number(values.weight), Number(values.height));
    try {
      await onSubmit({
        date: values.date,
        height: Number(values.height),
        weight: Number(values.weight),
        bmi: Math.round(bmi * 100) / 100,
      });
      setToast({ type: 'success', msg: 'Entry saved!' });
      reset({ date: format(new Date(), 'yyyy-MM-dd') });
    } catch (err) {
      setToast({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save',
      });
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">Log Entry</h2>

      {toast && (
        <div
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            max={format(new Date(), 'yyyy-MM-dd')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && (
            <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            {...register('height', {
              required: 'Height is required',
              min: { value: 50, message: 'Min 50 cm' },
              max: { value: 300, message: 'Max 300 cm' },
            })}
          />
          {errors.height && (
            <p className="text-xs text-red-500 mt-1">{errors.height.message}</p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            {...register('weight', {
              required: 'Weight is required',
              min: { value: 1, message: 'Min 1 kg' },
              max: { value: 500, message: 'Max 500 kg' },
            })}
          />
          {errors.weight && (
            <p className="text-xs text-red-500 mt-1">{errors.weight.message}</p>
          )}
        </div>

        {/* BMI Preview */}
        {bmiPreview !== null && zone && (
          <div
            className="rounded-lg px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor: BMI_ZONE_COLORS[zone] + '55',
              borderLeft: `4px solid ${BMI_ZONE_COLORS[zone]}`,
            }}
          >
            BMI: <span className="font-bold">{bmiPreview.toFixed(1)}</span>
            {' — '}
            {BMI_ZONE_LABELS[zone]}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2 text-sm transition-colors"
        >
          {isSubmitting ? 'Saving…' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
}

