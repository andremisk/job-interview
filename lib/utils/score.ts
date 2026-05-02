export function scoreToColorClass(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export function scoreToBgClass(score: number): string {
  if (score >= 75) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs work";
}

export function averageScores(scores: (number | null)[]): number {
  const valid = scores.filter((s): s is number => s !== null);
  if (valid.length === 0) return 0;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}
