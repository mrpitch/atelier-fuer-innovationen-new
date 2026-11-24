import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function ErsteAnnaeherung({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-erste-annaeherung"
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
					d="M50 76C57.732 76 64 69.732 64 62C64 54.268 57.732 48 50 48C42.268 48 36 54.268 36 62C36 69.732 42.268 76 50 76Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					fill="none"
					d="M96 132V72H184V184H96V160"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M116 140V92H164V164H140"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M54 78C53.8006 78.6778 53.6108 79.3556 53.4306 80.0331M150 106H147.8M52.0504 86.1997C51.7976 87.5924 51.5855 88.9804 51.4142 90.3614M50.914 96.6596C50.8658 98.0775 50.8623 99.4837 50.9035 100.875M51.41 107.173C51.5972 108.578 51.8335 109.963 52.1189 111.323M53.7826 117.416C54.2397 118.758 54.7506 120.067 55.3153 121.342M58.2747 126.919C59.0244 128.112 59.8312 129.262 60.6949 130.366M64.9712 135.01C65.9969 135.957 67.0786 136.852 68.2163 137.691M73.5824 141.015C74.8136 141.647 76.0949 142.225 77.4263 142.745M83.455 144.613C84.7912 144.928 86.1685 145.192 87.5869 145.402M93.8773 145.964C94.5764 145.988 95.2839 146 96 146H98.1333M104.533 146H108.8M115.2 146H119.467M125.867 146H128V144M128 138V134M128 128V124M128 118V114M128 108V106H130.2M136.8 106H141.2"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-primary"
				/>
				<path
					d="M55 120.5C56.933 120.5 58.5 118.933 58.5 117C58.5 115.067 56.933 113.5 55 113.5C53.067 113.5 51.5 115.067 51.5 117C51.5 118.933 53.067 120.5 55 120.5Z"
					className="fill-primary"
				/>
				<path
					d="M96 149.5C97.933 149.5 99.5 147.933 99.5 146C99.5 144.067 97.933 142.5 96 142.5C94.067 142.5 92.5 144.067 92.5 146C92.5 147.933 94.067 149.5 96 149.5Z"
					className="fill-primary"
				/>
				<path
					d="M128 149.5C129.933 149.5 131.5 147.933 131.5 146C131.5 144.067 129.933 142.5 128 142.5C126.067 142.5 124.5 144.067 124.5 146C124.5 147.933 126.067 149.5 128 149.5Z"
					className="fill-primary"
				/>
				<path
					d="M128 109.5C129.933 109.5 131.5 107.933 131.5 106C131.5 104.067 129.933 102.5 128 102.5C126.067 102.5 124.5 104.067 124.5 106C124.5 107.933 126.067 109.5 128 109.5Z"
					className="fill-primary"
				/>
				<path
					d="M152 111C154.761 111 157 108.761 157 106C157 103.239 154.761 101 152 101C149.239 101 147 103.239 147 106C147 108.761 149.239 111 152 111Z"
					className="fill-primary"
				/>
			</g>
		</svg>
	)
}

export { ErsteAnnaeherung }
