import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function Zukunft({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-zukunft"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<IllustrationFrame />
				<path
					opacity="0.08"
					d="M120 202C153.137 202 180 199.314 180 196C180 192.686 153.137 190 120 190C86.8629 190 60 192.686 60 196C60 199.314 86.8629 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M158 62L170 196M176 62L190 196"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M160 86H177M162 110H179M164 134H182M167 158H185M169 182H188"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					d="M138 60H158C140 112 116 170 66 196H42C96 168 118 110 138 60Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					fill="none"
					d="M146 66C130 116 108 166 62 190"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary-foreground"
				/>
				<path
					d="M178 54H136C134.895 54 134 54.8954 134 56V60C134 61.1046 134.895 62 136 62H178C179.105 62 180 61.1046 180 60V56C180 54.8954 179.105 54 178 54Z"
					className="fill-foreground"
				/>
				<path
					d="M38 195C42.9706 195 47 190.971 47 186C47 181.029 42.9706 177 38 177C33.0294 177 29 181.029 29 186C29 190.971 33.0294 195 38 195Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					d="M86 52L89 63L100 66L89 69L86 80L83 69L72 66L83 63L86 52Z"
					className="fill-primary"
				/>
			</g>
		</svg>
	)
}

export { Zukunft }
