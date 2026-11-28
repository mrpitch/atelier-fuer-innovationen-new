// A band inside SiteShell's 1280px cap whose background (and, for the Place
// bar, its Haarlinie) still runs edge to edge: a viewport-wide pseudo-element
// behind the content, copying the element's own background. The content
// itself stays inside the cap, aligned with the Header.
const fullBleedBackground =
	'relative isolate before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-inherit before:content-[""]'

// The Place bar's Haarlinie, drawn on the full-bleed pseudo-element instead of
// the capped bar.
const fullBleedHairline = 'before:border-b before:border-border'

export { fullBleedBackground, fullBleedHairline }
