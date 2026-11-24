import { DM_Mono, Instrument_Serif, Literata, Schibsted_Grotesk } from 'next/font/google'

// Weights and styles follow the Kartei design system's typography. Schibsted Grotesk and Literata
// are variable fonts, so they load their whole weight axis.

// Interface: body copy, controls, navigation.
export const sans = Schibsted_Grotesk({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-sans',
})

// The original Xenia texts, italic included for their emphasis.
export const serif = Literata({
	subsets: ['latin'],
	style: ['normal', 'italic'],
	display: 'swap',
	variable: '--font-serif',
})

// Display serif for headings and large numerals. The family ships weight 400 only.
export const heading = Instrument_Serif({
	weight: '400',
	style: ['normal', 'italic'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-heading',
})

// Labels, counts and measurements (the Kartei design system's Label uses 500).
export const mono = DM_Mono({
	weight: ['400', '500'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-mono',
})
