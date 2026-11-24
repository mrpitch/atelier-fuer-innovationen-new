import type * as React from 'react'

import { IllustrationFrame } from './illustration-frame'

function Wertschoepfung({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-wertschoepfung"
			role="img"
			aria-label={label}
			viewBox="0 0 240 240"
			{...props}
		>
			<g>
				<IllustrationFrame />
				<path
					opacity="0.08"
					d="M120 202C142.091 202 160 199.314 160 196C160 192.686 142.091 190 120 190C97.9086 190 80 192.686 80 196C80 199.314 97.9086 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M70 204L84 196M96 206L108 196M146 206L134 196M170 204L156 196"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-border"
				/>
				<path
					d="M112 196L114 128C118 124 122 124 126 128L128 196H112Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M69.9999 110C57.9999 78 89.9999 54 110 64C120 38 162 42 164 72C192 76 194 116 168 124C160 142 130 144 120 132C104 146 71.9999 138 69.9999 110Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					fill="none"
					d="M120 132V100M120 116L102 100M120 110L138 94"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					d="M94 102C97.3137 102 100 99.3137 100 96C100 92.6863 97.3137 90 94 90C90.6863 90 88 92.6863 88 96C88 99.3137 90.6863 102 94 102Z"
					className="fill-primary"
				/>
				<path
					d="M146 88C149.314 88 152 85.3137 152 82C152 78.6863 149.314 76 146 76C142.686 76 140 78.6863 140 82C140 85.3137 142.686 88 146 88Z"
					className="fill-primary"
				/>
				<path
					d="M152 116C155.314 116 158 113.314 158 110C158 106.686 155.314 104 152 104C148.686 104 146 106.686 146 110C146 113.314 148.686 116 152 116Z"
					className="fill-primary"
				/>
				<path
					d="M108 80C111.314 80 114 77.3137 114 74C114 70.6863 111.314 68 108 68C104.686 68 102 70.6863 102 74C102 77.3137 104.686 80 108 80Z"
					className="fill-primary"
				/>
			</g>
		</svg>
	)
}

export { Wertschoepfung }
