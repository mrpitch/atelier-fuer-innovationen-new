import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function Kontexte({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-kontexte"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<IllustrationFrame />
				<path
					opacity="0.08"
					d="M120 202C145.405 202 166 199.314 166 196C166 192.686 145.405 190 120 190C94.5949 190 74 192.686 74 196C74 199.314 94.5949 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					d="M82 62H158V180C158 188 154 192 146 192H94C86 192 82 188 82 180V62Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M84 118H156V180C156 186.667 152.667 190 146 190H94C87.3333 190 84 186.667 84 180V118Z"
					className="fill-chart-4"
				/>
				<path
					fill="none"
					d="M74 62H166"
					strokeWidth="3"
					strokeLinecap="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M90 80H100M90 94H96M90 108H100M90 122H96"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-foreground"
				/>
				<path
					d="M124 178C140.569 178 154 164.569 154 148C154 131.431 140.569 118 124 118C107.431 118 94 131.431 94 148C94 164.569 107.431 178 124 178Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					fill="none"
					d="M136 148C136 164.569 130.627 178 124 178C117.373 178 112 164.569 112 148C112 131.431 117.373 118 124 118C130.627 118 136 131.431 136 148Z"
					strokeWidth="2"
					className="stroke-primary-foreground"
				/>
				<path
					fill="none"
					d="M94 148H154M99 132H149M99 164H149"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary-foreground"
				/>
				<path
					fill="none"
					d="M146 98C146 100.209 144.209 102 142 102C139.791 102 138 100.209 138 98C138 95.7909 139.791 94 142 94C144.209 94 146 95.7909 146 98Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M135 84C135 85.6569 133.657 87 132 87C130.343 87 129 85.6569 129 84C129 82.3431 130.343 81 132 81C133.657 81 135 82.3431 135 84Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
			</g>
		</svg>
	)
}

export { Kontexte }
