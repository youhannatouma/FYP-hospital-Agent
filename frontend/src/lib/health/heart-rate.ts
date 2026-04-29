export type HeartRateBaseline = {
  label: string;
  min: number;
  max: number;
};

export function calculateAgeFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  const years = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  return years - (beforeBirthday ? 1 : 0);
}

export function getHeartRateBaselineByAge(age: number | null): HeartRateBaseline {
  if (age === null || age < 0) {
    return { label: "Estimated baseline", min: 60, max: 100 };
  }
  if (age <= 2) return { label: "Age baseline", min: 98, max: 140 };
  if (age <= 5) return { label: "Age baseline", min: 80, max: 120 };
  if (age <= 11) return { label: "Age baseline", min: 75, max: 118 };
  if (age <= 17) return { label: "Age baseline", min: 60, max: 100 };
  if (age <= 64) return { label: "Age baseline", min: 60, max: 100 };
  return { label: "Age baseline", min: 55, max: 95 };
}

export function midpoint(min: number, max: number): number {
  return Math.round((min + max) / 2);
}
