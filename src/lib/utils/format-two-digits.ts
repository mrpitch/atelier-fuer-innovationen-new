// A number as the two digits the design shows it with: 1 → "01" (a Viertel's
// own number, a Rundgang's, a Station's).
export function formatTwoDigits(value: number): string {
	return String(value).padStart(2, '0')
}
