// URL rules (ADR-0001, ADR-0003), one place for German and localized URLs.
// Every function is pure. A document's URL is its parent's URL plus its own
// segment: a translation's `slug` replaces that final segment, and wherever a
// URL contains an ancestor Seite's folder name (/stadt/…, /themen/…), the
// ancestor's translated slug takes its place.

export interface UrlScope {
	// Set for a configured locale: every URL gets a `/<locale>` prefix. German,
	// the default locale, stays unprefixed.
	readonly locale?: string
	// The translated slug of the Seite with this ID in this locale, if its
	// translation sets one.
	readonly slugOf?: (seiteId: string) => string | undefined
}

// A URL joined from a parent URL and one segment ('/' as a parent adds none).
export function childUrl(parentUrl: string, segment: string): string {
	return parentUrl === '/' ? `/${segment}` : `${parentUrl}/${segment}`
}

// Seite, Viertel, Zentrum, Aufsatz, Rundgang and Thema: the URL is the
// document's folder path (ADR-0003; the location rules put each of them at
// exactly the path its URL rule names). Each ancestor segment uses the
// ancestor Seite's translated slug when one exists; the document's own final
// segment uses its own `slug`.
export function pathUrl(id: string, scope: UrlScope = {}, slug?: string): string {
	const base = scope.locale === undefined ? '' : `/${scope.locale}`
	if (id === '') return slug === undefined ? base || '/' : `${base}/${slug}`

	const segments = id.split('/')
	const translated = segments.map((segment, index) => {
		if (index === segments.length - 1 && slug !== undefined) return slug
		return scope.slugOf?.(segments.slice(0, index + 1).join('/')) ?? segment
	})
	return `${base}/${translated.join('/')}`
}

// Kapitel: its Viertel's URL plus `kapitel-{n}`.
export function kapitelUrl(viertelUrl: string, number: number, slug?: string): string {
	return childUrl(viertelUrl, slug ?? `kapitel-${number}`)
}

// Abschnitt: its Kapitel's URL plus its position.
export function abschnittUrl(kapitelUrl: string, position: number, slug?: string): string {
	return childUrl(kapitelUrl, slug ?? String(position))
}

// Station: its Rundgang's URL plus its number.
export function stationUrl(rundgangUrl: string, number: number, slug?: string): string {
	return childUrl(rundgangUrl, slug ?? String(number))
}
