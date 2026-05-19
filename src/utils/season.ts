const NZ_TIME_ZONE = 'Pacific/Auckland';

export function getNzDate(now = new Date()): Date {
  const nzDateString = now.toLocaleString('en-NZ', { timeZone: NZ_TIME_ZONE });
  return new Date(nzDateString);
}

export function formatNzDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: NZ_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getNzSeason(date = new Date()): string {
  const month = Number(
    new Intl.DateTimeFormat('en-NZ', { timeZone: NZ_TIME_ZONE, month: 'numeric' }).format(date),
  );

  if ([12, 1, 2].includes(month)) return 'Summer';
  if ([3, 4, 5].includes(month)) return 'Autumn';
  if ([6, 7, 8].includes(month)) return 'Winter';
  return 'Spring';
}

export function getNzMonth(date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('en-NZ', { timeZone: NZ_TIME_ZONE, month: 'numeric' }).format(date),
  );
}

export function formatMonthRange(months: number[]): string {
  const formatter = new Intl.DateTimeFormat('en-NZ', { month: 'short' });
  return months
    .map((month) => formatter.format(new Date(2024, month - 1, 1)))
    .join(', ');
}
