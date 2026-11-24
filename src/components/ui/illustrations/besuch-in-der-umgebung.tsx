import type * as React from 'react'

function BesuchInDerUmgebung({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-besuch-in-der-umgebung"
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
					d="M120 202C152.033 202 178 199.314 178 196C178 192.686 152.033 190 120 190C87.9675 190 62 192.686 62 196C62 199.314 87.9675 202 120 202Z"
					className="fill-foreground"
				/>
				<path
					d="M186 72C193.732 72 200 65.732 200 58C200 50.268 193.732 44 186 44C178.268 44 172 50.268 172 58C172 65.732 178.268 72 186 72Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					fill="none"
					d="M62 82H170V186H132"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M108 186H62V82"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M82 102H150V166H100V122H130V146"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					d="M116 139C118.761 139 121 136.761 121 134C121 131.239 118.761 129 116 129C113.239 129 111 131.239 111 134C111 136.761 113.239 139 116 139Z"
					className="fill-primary"
				/>
				<path
					fill="none"
					d="M120 186C120.283 186.637 120.606 187.246 120.967 187.827M186 74C186.138 74.6194 186.278 75.2507 186.419 75.8939M125.193 192.308C126.288 193.095 127.494 193.769 128.794 194.324M134.76 195.956C136.087 196.144 137.465 196.239 138.88 196.236M145.043 195.643C146.369 195.394 147.711 195.066 149.061 194.657M154.833 192.417C156.055 191.836 157.274 191.186 158.483 190.466M163.581 186.95C164.641 186.111 165.686 185.213 166.711 184.254M170.974 179.757C171.846 178.721 172.696 177.634 173.52 176.493M176.875 171.29C177.549 170.116 178.197 168.898 178.816 167.635M181.283 161.958C181.529 161.315 181.768 160.663 182 160C182.217 159.381 182.429 158.764 182.636 158.151M184.404 152.612C184.783 151.354 185.141 150.109 185.48 148.877M186.925 143.225C187.227 141.947 187.508 140.684 187.769 139.435M188.851 133.707C189.069 132.412 189.266 131.133 189.444 129.87M190.133 124.083C190.261 122.776 190.367 121.487 190.455 120.217M190.729 114.398C190.762 113.08 190.775 111.783 190.769 110.508M190.616 104.683C190.553 103.367 190.471 102.077 190.374 100.811M189.805 95.0073C189.649 93.6946 189.478 92.4119 189.296 91.1588M188.355 85.4102C188.118 84.1008 187.873 82.8285 187.625 81.5929"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary"
				/>
			</g>
		</svg>
	)
}

export { BesuchInDerUmgebung }
