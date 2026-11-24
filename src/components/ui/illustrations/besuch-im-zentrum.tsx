import type * as React from 'react'

function BesuchImZentrum({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-besuch-im-zentrum"
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
				<path d="M138 114H102V150H138V114Z" className="fill-card" />
				<path
					fill="none"
					d="M66 78H174V186H66V78Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M102 78V186M138 78V186M66 114H174M66 150H174"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-foreground"
				/>
				<path
					fill="none"
					d="M120 132L118.56 130.56M84 132V133.8M84 139.2V142.8M84 148.2V151.8M84 157.2V160.8M84 166.2V168H86.0571M92.2286 168H96.3429M102.514 168H106.629M112.8 168H116.914M123.086 168H127.2M133.371 168H137.486M143.657 168H147.771M153.943 168H156V165.943M156 159.771V155.657M156 149.486V145.371M156 139.2V135.086M156 128.914V124.8M156 118.629V114.514M156 108.343V104.229M156 98.0571V96H153.943M147.771 96H143.657M137.486 96H133.371M127.2 96H123.086M116.914 96H112.8M106.629 96H102.514M96.3429 96H92.2286M86.0571 96H84L85.44 97.44M89.76 101.76L92.64 104.64M96.96 108.96L99.84 111.84M104.16 116.16L107.04 119.04M111.36 123.36L114.24 126.24"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-primary"
				/>
				<path
					d="M84 99.5C85.933 99.5 87.5 97.933 87.5 96C87.5 94.067 85.933 92.5 84 92.5C82.067 92.5 80.5 94.067 80.5 96C80.5 97.933 82.067 99.5 84 99.5Z"
					className="fill-primary"
				/>
				<path
					d="M120 99.5C121.933 99.5 123.5 97.933 123.5 96C123.5 94.067 121.933 92.5 120 92.5C118.067 92.5 116.5 94.067 116.5 96C116.5 97.933 118.067 99.5 120 99.5Z"
					className="fill-primary"
				/>
				<path
					d="M156 99.5C157.933 99.5 159.5 97.933 159.5 96C159.5 94.067 157.933 92.5 156 92.5C154.067 92.5 152.5 94.067 152.5 96C152.5 97.933 154.067 99.5 156 99.5Z"
					className="fill-primary"
				/>
				<path
					d="M156 135.5C157.933 135.5 159.5 133.933 159.5 132C159.5 130.067 157.933 128.5 156 128.5C154.067 128.5 152.5 130.067 152.5 132C152.5 133.933 154.067 135.5 156 135.5Z"
					className="fill-primary"
				/>
				<path
					d="M156 171.5C157.933 171.5 159.5 169.933 159.5 168C159.5 166.067 157.933 164.5 156 164.5C154.067 164.5 152.5 166.067 152.5 168C152.5 169.933 154.067 171.5 156 171.5Z"
					className="fill-primary"
				/>
				<path
					d="M120 171.5C121.933 171.5 123.5 169.933 123.5 168C123.5 166.067 121.933 164.5 120 164.5C118.067 164.5 116.5 166.067 116.5 168C116.5 169.933 118.067 171.5 120 171.5Z"
					className="fill-primary"
				/>
				<path
					d="M84 171.5C85.933 171.5 87.5 169.933 87.5 168C87.5 166.067 85.933 164.5 84 164.5C82.067 164.5 80.5 166.067 80.5 168C80.5 169.933 82.067 171.5 84 171.5Z"
					className="fill-primary"
				/>
				<path
					d="M84 135.5C85.933 135.5 87.5 133.933 87.5 132C87.5 130.067 85.933 128.5 84 128.5C82.067 128.5 80.5 130.067 80.5 132C80.5 133.933 82.067 135.5 84 135.5Z"
					className="fill-primary"
				/>
				<path
					d="M120 138C123.314 138 126 135.314 126 132C126 128.686 123.314 126 120 126C116.686 126 114 128.686 114 132C114 135.314 116.686 138 120 138Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
			</g>
		</svg>
	)
}

export { BesuchImZentrum }
