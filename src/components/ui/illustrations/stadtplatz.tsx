import type * as React from 'react'

function Stadtplatz({ label, ...props }: { label: string } & React.ComponentProps<'svg'>) {
	return (
		<svg
			data-slot="illustration-stadtplatz"
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
					d="M42 132V98L58 84L74 98V132H42Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M74 132V90L90 76L106 90V132H74Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M106 132V68L120 52L134 68V132H106Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
				<path
					d="M134 132V90L150 76L166 90V132H134Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M166 132V98L182 84L198 98V132H166Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-card stroke-foreground"
				/>
				<path
					d="M52 106H60V114H52V106ZM86 100H94V108H86V100ZM146 100H154V108H146V100ZM178 106H186V114H178V106Z"
					className="fill-foreground"
				/>
				<path
					d="M116 80H124V92H116V80ZM116 104H124V116H116V104Z"
					className="fill-primary-foreground"
				/>
				<path
					d="M120 188C166.392 188 204 178.15 204 166C204 153.85 166.392 144 120 144C73.6081 144 36 153.85 36 166C36 178.15 73.6081 188 120 188Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-chart-4 stroke-foreground"
				/>
				<path
					fill="none"
					d="M120 166L118.575 165.887M120 166L118.5 166.562M120 166V167.375M120 166L121.5 166.562M120 166L121.425 165.888M120 166L118.875 165.25M120 166L121.125 165.25M44 160L45.425 160.112M72 184L73.5 183.438M120 188V186.625M168 184L166.5 183.438M196 160L194.575 160.113M90 146L91.125 146.75M150 146L148.875 146.75M50.175 160.487L53.025 160.713M57.775 161.088L60.625 161.313M65.375 161.688L68.225 161.913M72.975 162.288L75.825 162.513M80.575 162.888L83.425 163.113M88.175 163.488L91.025 163.712M95.775 164.087L98.625 164.312M103.375 164.687L106.225 164.912M110.975 165.287L113.825 165.512M78.5 181.562L81.5 180.437M86.5 178.562L89.5 177.437M94.5 175.562L97.5 174.438M102.5 172.562L105.5 171.437M110.5 169.562L113.5 168.437M120 171.958V174.708M120 179.292V182.042M126.5 168.438L129.5 169.563M134.5 171.438L137.5 172.563M142.5 174.438L145.5 175.562M150.5 177.438L153.5 178.563M158.5 180.438L161.5 181.563M126.175 165.513L129.025 165.287M133.775 164.912L136.625 164.687M141.375 164.312L144.225 164.087M148.975 163.712L151.825 163.487M156.575 163.112L159.425 162.887M164.175 162.512L167.025 162.288M171.775 161.913L174.625 161.688M179.375 161.313L182.225 161.088M186.975 160.713L189.825 160.488M94.875 149.25L97.125 150.75M100.875 153.25L103.125 154.75M106.875 157.25L109.125 158.75M112.875 161.25L115.125 162.75M124.875 162.75L127.125 161.25M130.875 158.75L133.125 157.25M136.875 154.75L139.125 153.25M142.875 150.75L145.125 149.25"
					strokeWidth="2"
					strokeLinecap="round"
					className="stroke-primary"
				/>
				<path
					d="M120 175C124.971 175 129 170.971 129 166C129 161.029 124.971 157 120 157C115.029 157 111 161.029 111 166C111 170.971 115.029 175 120 175Z"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="fill-primary stroke-foreground"
				/>
			</g>
		</svg>
	)
}

export { Stadtplatz }
