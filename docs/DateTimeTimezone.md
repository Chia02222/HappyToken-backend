# Date and Time Policy

## Rules
- Agreement dates are pure dates → use `DATE` in DB, treated as `YYYY-MM-DD` strings throughout BE/FE.
- Timestamps (e.g., logs) use `TIMESTAMP WITHOUT TIME ZONE`.
- Do not send `Date` objects for agreement dates across API; send strings.
- Display dates in Malaysia time (`Asia/Kuala_Lumpur`) on the frontend.

## Backend Handling
- Database returns DATE as strings (or normalize to strings in service layer if driver returns Date).
- When encountering `Date` objects from drivers, convert to Malaysia-local `YYYY-MM-DD` if needed.

Example normalization:
```ts
function toYmd(date: Date): string {
  const malaysia = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
  const y = malaysia.getFullYear();
  const m = String(malaysia.getMonth() + 1).padStart(2, '0');
  const d = String(malaysia.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

## Frontend Contract
- Input/output for pure dates: `YYYY-MM-DD`.
- Use `<input type="date">` and `.slice(0,10)` for ISO strings if needed.

## Common Pitfalls
- UTC midnight shifts producing `16:00:00.000Z` the previous day → always treat pure dates as strings, not `Date`.
- Driver parsing differences (Neon vs pg) → normalize at service boundary.
