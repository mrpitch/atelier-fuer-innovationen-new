import type * as React from 'react'

function Fuehrung({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-fuehrung"
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
					d="M120 202C154.242 202 182 199.314 182 196C182 192.686 154.242 190 120 190C85.7583 190 58 192.686 58 196C58 199.314 85.7583 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M64 160L28 182M176 160L212 182"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					d="M64 160C68 181.333 86.6667 192 120 192C153.333 192 172 181.333 176 160H64Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M120 170C150.928 170 176 165.523 176 160C176 154.477 150.928 150 120 150C89.0721 150 64 154.477 64 160C64 165.523 89.0721 170 120 170Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					fill="none"
					d="M172 158C165.333 111.333 148 80.6667 120 66C92 80.6667 74.6667 111.333 68 158M120 66C104 88.6667 94.6667 122.333 92 167M120 66V170M120 66C136 88.6667 145.333 122.333 148 167"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M142 100C142 102.761 132.15 105 120 105C107.85 105 98 102.761 98 100C98 97.2386 107.85 95 120 95C132.15 95 142 97.2386 142 100Z"
					strokeWidth="2"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M160 132C160 136.418 142.091 140 120 140C97.9086 140 80 136.418 80 132C80 127.582 97.9086 124 120 124C142.091 124 160 127.582 160 132Z"
					strokeWidth="2"
					className="stroke-foreground"
				/>
				<path
					d="M120 72C123.314 72 126 69.3137 126 66C126 62.6863 123.314 60 120 60C116.686 60 114 62.6863 114 66C114 69.3137 116.686 72 120 72Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M98 103.5C99.933 103.5 101.5 101.933 101.5 100C101.5 98.067 99.933 96.5 98 96.5C96.067 96.5 94.5 98.067 94.5 100C94.5 101.933 96.067 103.5 98 103.5Z"
					className="fill-primary"
				/>
				<path
					d="M142 103.5C143.933 103.5 145.5 101.933 145.5 100C145.5 98.067 143.933 96.5 142 96.5C140.067 96.5 138.5 98.067 138.5 100C138.5 101.933 140.067 103.5 142 103.5Z"
					className="fill-primary"
				/>
				<path
					d="M80 135.5C81.933 135.5 83.5 133.933 83.5 132C83.5 130.067 81.933 128.5 80 128.5C78.067 128.5 76.5 130.067 76.5 132C76.5 133.933 78.067 135.5 80 135.5Z"
					className="fill-primary"
				/>
				<path
					d="M160 135.5C161.933 135.5 163.5 133.933 163.5 132C163.5 130.067 161.933 128.5 160 128.5C158.067 128.5 156.5 130.067 156.5 132C156.5 133.933 158.067 135.5 160 135.5Z"
					className="fill-primary"
				/>
			</g>
		</svg>
	)
}

export { Fuehrung }
