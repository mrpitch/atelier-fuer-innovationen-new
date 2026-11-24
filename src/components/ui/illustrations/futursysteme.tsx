import type * as React from 'react'

function Futursysteme({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-futursysteme"
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
					d="M120 202C147.614 202 170 199.314 170 196C170 192.686 147.614 190 120 190C92.3858 190 70 192.686 70 196C70 199.314 92.3858 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					fill="none"
					d="M38 172C38.336 171.454 38.6773 170.906 39.0238 170.355M204 42C203.358 42.0475 202.713 42.1049 202.064 42.1721M42.2348 165.407C42.9582 164.324 43.6999 163.234 44.4592 162.138M47.8679 157.333C48.6275 156.287 49.4019 155.237 50.1906 154.182M53.7691 149.491C54.572 148.46 55.3875 147.425 56.2154 146.387M59.9271 141.817C60.7553 140.815 61.5942 139.812 62.4434 138.807M66.2888 134.329C67.1468 133.346 68.014 132.363 68.89 131.379M72.8434 127.008C73.7278 126.044 74.6201 125.081 75.5201 124.12M79.5833 119.841C80.4887 118.902 81.401 117.964 82.3198 117.028M86.4829 112.847C87.413 111.927 88.3489 111.009 89.2904 110.094M93.5488 106.015C94.5014 105.115 95.4591 104.219 96.4215 103.328M100.776 99.3511C101.75 98.4741 102.729 97.6017 103.712 96.7346M108.163 92.8656C109.159 92.0124 110.159 91.165 111.163 90.3237M115.713 86.5687C116.731 85.7422 117.751 84.9226 118.774 84.1104M123.425 80.4801C124.469 79.6795 125.515 78.887 126.562 78.1031M131.313 74.6147C132.381 73.8456 133.451 73.086 134.521 72.3364M139.387 68.9994C140.478 68.2678 141.569 67.5473 142.66 66.8383M147.639 63.6824C148.765 62.9872 149.89 62.3051 151.013 61.6367M156.12 58.688C157.267 58.0461 158.412 57.4194 159.555 56.8085M164.803 54.105C165.992 53.5167 167.177 52.9467 168.357 52.3955M173.746 50.0009C174.96 49.4892 176.169 48.9991 177.373 48.5311M182.915 46.521C184.177 46.0972 185.432 45.7 186.679 45.3303M192.376 43.8205C193.672 43.5196 194.957 43.2512 196.231 43.0165"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary"
				/>
				<path
					fill="none"
					d="M194 34L206 42L196 52"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-primary"
				/>
				<path
					d="M80 196L104 70L126 196H80Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M104 70L126 196H172L156 86L104 70Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					fill="none"
					d="M104 70L156 86"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M116 120L146 128M120 150L152 158"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-border"
				/>
			</g>
		</svg>
	)
}

export { Futursysteme }
