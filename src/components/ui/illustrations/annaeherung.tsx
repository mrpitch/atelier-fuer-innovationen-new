import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function Annaeherung({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-annaeherung"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<IllustrationFrame />
				<path
					opacity="0.08"
					d="M120 202C136.569 202 150 199.314 150 196C150 192.686 136.569 190 120 190C103.431 190 90 192.686 90 196C90 199.314 103.431 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M60 230C60.5031 229.597 61.0091 229.206 61.5177 228.826M204 190C203.416 190.25 202.822 190.472 202.218 190.67M66.2553 225.632C67.3545 224.967 68.4635 224.345 69.5811 223.763M74.7678 221.362C75.9518 220.877 77.1429 220.431 78.3396 220.019M83.8153 218.367C85.0495 218.045 86.2872 217.752 87.527 217.485M93.1516 216.442C94.4115 216.242 95.6711 216.064 96.9287 215.902M102.614 215.271C103.887 215.149 105.155 215.039 106.416 214.935M112.121 214.497C113.4 214.402 114.669 214.308 115.928 214.21M121.628 213.713C122.909 213.586 124.173 213.446 125.419 213.288M131.071 212.408C132.338 212.166 133.58 211.895 134.795 211.588M140.249 209.865C141.444 209.4 142.604 208.882 143.724 208.304M148.538 205.229C149.036 204.838 149.524 204.429 150 204C150.482 203.566 150.964 203.148 151.446 202.746M156.044 199.364C157.143 198.658 158.239 198.025 159.333 197.455M164.573 195.179C165.794 194.747 167.009 194.382 168.217 194.073M173.824 192.996C175.098 192.824 176.361 192.698 177.612 192.605M183.322 192.358C184.61 192.333 185.881 192.322 187.131 192.309M192.843 192.17C194.137 192.105 195.403 192.008 196.639 191.857"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary"
				/>
				<path
					d="M122 56H118C116.895 56 116 56.8954 116 58V194C116 195.105 116.895 196 118 196H122C123.105 196 124 195.105 124 194V58C124 56.8954 123.105 56 122 56Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M120 57C123.866 57 127 53.866 127 50C127 46.134 123.866 43 120 43C116.134 43 113 46.134 113 50C113 53.866 116.134 57 120 57Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M80 70H150L164 82L150 94H80V70Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					fill="none"
					d="M92 82H138"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary-foreground"
				/>
				<path
					d="M160 108H92L78 120L92 132H160V108Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					fill="none"
					d="M100 116H146M100 124H132"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-border"
				/>
			</g>
		</svg>
	)
}

export { Annaeherung }
