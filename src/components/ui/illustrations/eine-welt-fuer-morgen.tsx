import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function EineWeltFuerMorgen({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-eine-welt-fuer-morgen"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<IllustrationFrame />
				<path
					opacity="0.08"
					d="M120 202C150.928 202 176 199.314 176 196C176 192.686 150.928 190 120 190C89.0721 190 64 192.686 64 196C64 199.314 89.0721 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					d="M120 186C152.033 186 178 160.033 178 128C178 95.9675 152.033 70 120 70C87.9675 70 62 95.9675 62 128C62 160.033 87.9675 186 120 186Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					fill="none"
					d="M144 128C144 160.033 133.255 186 120 186C106.745 186 96 160.033 96 128C96 95.9675 106.745 70 120 70C133.255 70 144 95.9675 144 128Z"
					strokeWidth="2"
					className="stroke-primary-foreground"
				/>
				<path
					fill="none"
					d="M62 128H178M70 100H170M70 156H170"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary-foreground"
				/>
				<path
					fill="none"
					d="M209.267 105.743C211.939 116.461 174.139 135.114 124.838 147.406C75.5375 159.698 33.4049 160.974 30.7327 150.257C28.0605 139.539 65.8606 120.886 115.161 108.594C164.462 96.302 206.595 95.0256 209.267 105.743Z"
					strokeWidth="2"
					className="stroke-foreground"
				/>
				<path
					d="M34 153C37.866 153 41 149.866 41 146C41 142.134 37.866 139 34 139C30.134 139 27 142.134 27 146C27 149.866 30.134 153 34 153Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
			</g>
		</svg>
	)
}

export { EineWeltFuerMorgen }
