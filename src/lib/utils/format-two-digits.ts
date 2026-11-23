// A Viertel's fixed number as the two digits the design shows: 1 → "01".
export function formatTwoDigits(value: number): string {
	return String(value).padStart(2, '0')
}
