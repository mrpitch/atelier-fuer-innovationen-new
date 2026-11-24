import type * as React from 'react'

function Inszenierung({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-inszenierung"
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
					d="M120 202C138.778 202 154 199.314 154 196C154 192.686 138.778 190 120 190C101.222 190 86 192.686 86 196C86 199.314 101.222 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M108 146L104 192M132 146L136 192"
					strokeWidth="3"
					strokeLinecap="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M94 194H106M134 194H146"
					strokeWidth="4"
					strokeLinecap="round"
					className="stroke-foreground"
				/>
				<path
					d="M120 73C128.284 73 135 66.2843 135 58C135 49.7157 128.284 43 120 43C111.716 43 105 49.7157 105 58C105 66.2843 111.716 73 120 73Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M106 54C108.667 44.6667 114.667 40.6667 124 42C130.667 43.3333 134.333 47.3333 135 54"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M162 78H78C76.8954 78 76 78.8954 76 80V146C76 147.105 76.8954 148 78 148H162C163.105 148 164 147.105 164 146V80C164 78.8954 163.105 78 162 78Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					fill="none"
					d="M120 78V148"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					d="M111 88H85C84.4477 88 84 88.4477 84 89V94C84 94.5523 84.4477 95 85 95H111C111.552 95 112 94.5523 112 94V89C112 88.4477 111.552 88 111 88Z"
					className="fill-primary"
				/>
				<path
					d="M155 88H129C128.448 88 128 88.4477 128 89V94C128 94.5523 128.448 95 129 95H155C155.552 95 156 94.5523 156 94V89C156 88.4477 155.552 88 155 88Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M84 106H112M84 116H112M84 126H106M84 136H110"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-border"
				/>
				<path
					d="M154 104H130C128.895 104 128 104.895 128 106V124C128 125.105 128.895 126 130 126H154C155.105 126 156 125.105 156 124V106C156 104.895 155.105 104 154 104Z"
					className="fill-secondary"
				/>
				<path
					fill="none"
					d="M128 136H156"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-border"
				/>
				<path
					d="M76 106C79.3137 106 82 103.314 82 100C82 96.6863 79.3137 94 76 94C72.6863 94 70 96.6863 70 100C70 103.314 72.6863 106 76 106Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M164 106C167.314 106 170 103.314 170 100C170 96.6863 167.314 94 164 94C160.686 94 158 96.6863 158 100C158 103.314 160.686 106 164 106Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
			</g>
		</svg>
	)
}

export { Inszenierung }
