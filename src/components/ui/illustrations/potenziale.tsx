import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function Potenziale({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-potenziale"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<IllustrationFrame />
				<path
					opacity="0.08"
					d="M120 202C147.614 202 170 199.314 170 196C170 192.686 147.614 190 120 190C92.3858 190 70 192.686 70 196C70 199.314 92.3858 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					d="M98 120L109 100.9H131L142 120L131 139.1H109L98 120Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M65 101L76 81.9H98L109 101L98 120.1H76L65 101Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M65 139L76 119.9H98L109 139L98 158.1H76L65 139Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					d="M131 101L142 81.9H164L175 101L164 120.1H142L131 101Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					d="M131 139L142 119.9H164L175 139L164 158.1H142L131 139Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M98 82L109 62.9H131L142 82L131 101.1H109L98 82Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M98 158L109 138.9H131L142 158L131 177.1H109L98 158Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					fill="none"
					d="M165.222 79.8778L164 82L165.222 84.1222M168.278 74.5722L170.722 70.3278M173.778 65.0222L175 62.9H177.444M183.556 62.9H188.444M194.556 62.9H197L198.222 65.0222M201.278 70.3278L203.722 74.5722M206.778 79.8778L208 82L206.778 84.1222M203.722 89.4278L201.278 93.6722M198.222 98.9778L197 101.1H194.556M188.444 101.1H183.556M177.444 101.1H175L173.778 98.9778M170.722 93.6722L168.278 89.4278"
					strokeWidth="2"
					strokeLinejoin="round"
					className="stroke-primary"
				/>
				<path
					fill="none"
					d="M100 120H108M132 120H140"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary-foreground"
				/>
				<path
					fill="none"
					d="M120 178V196"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
			</g>
		</svg>
	)
}

export { Potenziale }
