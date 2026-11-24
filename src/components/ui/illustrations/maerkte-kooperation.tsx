import type * as React from 'react'

function MaerkteKooperation({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-maerkte-kooperation"
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
					d="M120 202C145.405 202 166 199.314 166 196C166 192.686 145.405 190 120 190C94.5949 190 74 192.686 74 196C74 199.314 94.5949 202 120 202Z"
					className="fill-foreground"
				/>
				<path d="M98 182H90V196H98V182Z" className="fill-foreground" />
				<path d="M150 182H142V196H150V182Z" className="fill-foreground" />
				<path
					d="M82 98C82 80.6667 94.6667 72 120 72C145.333 72 158 80.6667 158 98V184H82V98Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M136 94H104C101.791 94 100 95.7909 100 98C100 100.209 101.791 102 104 102H136C138.209 102 140 100.209 140 98C140 95.7909 138.209 94 136 94Z"
					className="fill-foreground"
				/>
				<path
					d="M138 118H102C99.7909 118 98 119.791 98 122V154C98 156.209 99.7909 158 102 158H138C140.209 158 142 156.209 142 154V122C142 119.791 140.209 118 138 118Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					fill="none"
					d="M106 130H134M106 140H128M106 150H122"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-border"
				/>
				<path
					d="M104 58L134 50L140 76L110 84L104 58Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					fill="none"
					d="M104 58L124 70L134 50"
					strokeWidth="2"
					strokeLinejoin="round"
					className="stroke-primary-foreground"
				/>
			</g>
		</svg>
	)
}

export { MaerkteKooperation }
