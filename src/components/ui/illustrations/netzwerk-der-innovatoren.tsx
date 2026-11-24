import type * as React from 'react'

function NetzwerkDerInnovatoren({
	label,
	...props
}: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-netzwerk-der-innovatoren"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<path
					d="M120 204C170.81 204 212 162.81 212 112C212 61.1898 170.81 20 120 20C69.1898 20 28 61.1898 28 112C28 162.81 69.1898 204 120 204Z"
					className="fill-secondary"
				/>
				<path
					fill="none"
					d="M28 196H212"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					opacity="0.08"
					d="M120 202C150.928 202 176 199.314 176 196C176 192.686 150.928 190 120 190C89.0721 190 64 192.686 64 196C64 199.314 89.0721 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M150 62L58 86L92 50L150 62ZM150 62L200 98L208 58L150 62Z"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-foreground"
				/>
				<path
					d="M72 196L150 62L182 150L72 196Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					fill="none"
					d="M150 62L182 150L194 196H72L150 62Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					d="M182 150L194 196H150L182 150Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					fill="none"
					d="M150 62L130 196"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary-foreground"
				/>
				<path
					d="M58 93C61.866 93 65 89.866 65 86C65 82.134 61.866 79 58 79C54.134 79 51 82.134 51 86C51 89.866 54.134 93 58 93Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M92 57C95.866 57 99 53.866 99 50C99 46.134 95.866 43 92 43C88.134 43 85 46.134 85 50C85 53.866 88.134 57 92 57Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					d="M200 105C203.866 105 207 101.866 207 98C207 94.134 203.866 91 200 91C196.134 91 193 94.134 193 98C193 101.866 196.134 105 200 105Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M208 65C211.866 65 215 61.866 215 58C215 54.134 211.866 51 208 51C204.134 51 201 54.134 201 58C201 61.866 204.134 65 208 65Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					d="M150 68C153.314 68 156 65.3137 156 62C156 58.6863 153.314 56 150 56C146.686 56 144 58.6863 144 62C144 65.3137 146.686 68 150 68Z"
					className="fill-foreground"
				/>
			</g>
		</svg>
	)
}

export { NetzwerkDerInnovatoren }
