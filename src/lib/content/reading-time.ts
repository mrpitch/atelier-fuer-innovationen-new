// An average silent-reading speed in German, for turning a body's length
// into a rough "ca. {n} Min." figure (issue #29).
const WORDS_PER_MINUTE = 200

// A document's reading time: word count over the reading speed above,
// rounded up, with a floor of one minute so even a very short body reads as
// "ca. 1 Min." rather than "ca. 0 Min.".
export function computeReadingTime(body: string): number {
	const wordCount = body.trim().split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

// A Rundgang's duration (issue #32): the sum of its Stationen's reading
// times, never a value of its own.
export function sumReadingTime(items: readonly { readonly readingTimeMinutes: number }[]): number {
	return items.reduce((total, item) => total + item.readingTimeMinutes, 0)
}
