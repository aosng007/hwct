export function calculateBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) {
    throw new RangeError('heightCm must be greater than 0');
  }
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BmiZone = 'underweight' | 'normal' | 'overweight' | 'obese';

export function getBmiZone(bmi: number): BmiZone {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export const BMI_ZONE_COLORS: Record<BmiZone, string> = {
  underweight: '#93c5fd', // blue-300
  normal: '#86efac',      // green-300
  overweight: '#fde047',  // yellow-300
  obese: '#fca5a5',       // red-300
};

export const BMI_ZONE_LABELS: Record<BmiZone, string> = {
  underweight: 'Underweight (<18.5)',
  normal: 'Normal (18.5–24.9)',
  overweight: 'Overweight (25–29.9)',
  obese: 'Obese (≥30)',
};
