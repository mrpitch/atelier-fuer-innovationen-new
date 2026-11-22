import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'export',
	// The default image loader needs a server; a static export can't use it.
	images: { unoptimized: true },
	turbopack: {
		rules: {
			'*.css': {
				loaders: ['@tailwindcss/turbopack'],
				as: '*.css',
			},
		},
	},
}

const withMDX = createMDX({
	options: {
		// Turbopack can't take plugin functions, only package names (ADR-0002).
		// remark-mdx-frontmatter strips the YAML remark-frontmatter parses, so the
		// compiled MDX module doesn't choke on it; our own loader parses the same
		// frontmatter separately for validation.
		remarkPlugins: ['remark-frontmatter', 'remark-mdx-frontmatter'],
	},
})

export default withMDX(nextConfig)
