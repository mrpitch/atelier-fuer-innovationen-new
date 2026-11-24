// The outer ring and ground line every drawing shares (issue #90). The export
// transform (scripts/illustration-transform.ts) emits this in place of the two
// paths when they match exactly.
function IllustrationFrame() {
	return (
		<>
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
		</>
	)
}

export { IllustrationFrame }
