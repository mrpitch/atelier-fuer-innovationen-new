import { cn } from 'cn'
import type * as React from 'react'

import { MonoLabel } from '@/components/ui/mono-label'
import type { Ort, Rundgang, Station, Viertel, Zentrum } from '@/lib/content'
import { shortTitleOrTitle } from '@/lib/content'
import { t } from '@/lib/dictionary'

import { RoutenStopp } from './routen-stopp'
import { Stopp, type StoppStatus } from './stopp'

interface StadtModeProps {
	mode?: 'stadt'
	// The 8 Viertel, in `stadt/meta.json` number order (ADR-0003) — the same
	// shape Stadtplan and MiniStadtplan take.
	viertel: readonly Viertel[]
	zentrum: Zentrum | undefined
	// The Viertel or the Zentrum whose page this Weg-Leiste sits on (issues
	// #97, #98): its Stopp is "aktuell", every other one "offen" (Stopp's own
	// comment: no reading state to mark one "gesehen" with). Its own number
	// ("Sie stehen bei n") is derived from this, the same way each Stopp's own
	// `nummer` already was (issue #118 folds the former separate
	// `aktuellNummer` prop into this one input).
	aktuellId: string
}

interface RundgangModeProps {
	mode: 'rundgang'
	rundgang: Rundgang
	// In route order (station.ts's orderStationen) — not renumbered here.
	stationen: readonly Station[]
	// Optional and empty on every current Rundgang-Übersicht (issue #118): a
	// Rundgang-Übersicht has no "current position" to report, unlike Stadt
	// mode's derived "Sie stehen bei n". Kept as an input, not hardcoded away,
	// so a future Rundgang that does have one doesn't need a new prop.
	hinweis?: string
}

type WegLeisteProps = React.ComponentProps<'nav'> & (StadtModeProps | RundgangModeProps)

function stoppFor(ort: Ort, nummer: number, aktuellId: string) {
	return (
		<Stopp
			key={ort.id}
			href={ort.url}
			nummer={nummer}
			illustrationId={ort.id}
			illustrationLabel={ort.title}
			status={ort.id === aktuellId ? 'aktuell' : 'offen'}
		/>
	)
}

// A Station's own Stopp (issue #118): a Stopp with the Station's Ort's
// illustration, or, when it stands at none, a Routen-Stopp with no
// illustration at all. The accessible label is the Station's own name, not
// the Ort's — the link goes to the Station, not the Ort page. Shared by the
// Weg-Leiste's Rundgang mode below, where every Stopp is "offen" (a
// Rundgang-Übersicht tracks no current position), and by a Station's own
// Stationsnavigation (issue #120), which passes the Station's actual
// "gesehen"/"aktuell"/"offen" status.
function stationStopp(station: Station, status: StoppStatus = 'offen') {
	const name = shortTitleOrTitle(station)
	return station.ortId ? (
		<Stopp
			key={station.id}
			href={station.url}
			nummer={station.number}
			illustrationId={station.ortId}
			illustrationLabel={name}
			status={status}
		/>
	) : (
		<RoutenStopp
			key={station.id}
			href={station.url}
			nummer={station.number}
			name={name}
			status={status}
		/>
	)
}

interface WegLeisteShellProps extends React.ComponentProps<'nav'> {
	navigationLabel: string
	label: string
	titel: string
	hinweis?: string
	children: React.ReactNode
}

// The Info block (Label, Titel, optional Hinweis) beside the Stopp row,
// shared by both modes below. Below `@xl` Info stacks over wrapping Stopps;
// from `@xl` every Stopp stays in one un-wrapped row (issue #98 — Figma
// T02@768, 36626:9182, never wraps it). Info only moves beside the Stopps
// from `@3xl`: at `md` the page section around this component (PageSection)
// doesn't leave enough of its own rendered width for both side by side at
// the Figma 768 frame's own proportions — a `container-type` concern, not a
// viewport one (issue #112, tailwind-conventions.md), so this reads the
// nav's own width via `@container` instead of a `md`/`lg` viewport
// breakpoint. `@xl` (36rem/576px) and `@3xl` (48rem/768px) are chosen to
// land this component's own rendered width at roughly the same viewports
// (768, 1024) the previous `md`/`lg` viewport breakpoints did, since
// PageSection's horizontal padding is constant above 768.
function WegLeisteShell({
	navigationLabel,
	label,
	titel,
	hinweis,
	children,
	className,
	...props
}: WegLeisteShellProps) {
	return (
		<nav
			data-slot="weg-leiste"
			aria-label={navigationLabel}
			className={cn('@container', className)}
			{...props}
		>
			{/* A container query only ever matches a descendant of the element that
			    establishes it (CSS containment), never that element itself — so the
			    `@xl`/`@3xl` variants below live on this inner div, one level under
			    the `@container` nav above. */}
			<div className="flex flex-col gap-3 rounded-xl bg-muted p-4 @xl:gap-4 @xl:px-6 @xl:py-4 @3xl:flex-row @3xl:items-center @3xl:gap-8">
				<div className="flex shrink-0 flex-col gap-1.5">
					<MonoLabel className="font-medium">{label}</MonoLabel>
					<p className="text-sm font-medium text-foreground">{titel}</p>
					{hinweis && <p className="text-xs text-muted-foreground">{hinweis}</p>}
				</div>
				<div className="flex flex-wrap items-center gap-2 @xl:flex-nowrap @xl:gap-1.5">
					{children}
				</div>
			</div>
		</nav>
	)
}

// Xenia / Weg / Weg-Leiste (Figma component set 36625:9074, issues #97,
// #118): two modes sharing the same Info-block-beside-Stopp-row shell
// (WegLeisteShell above).
//
// Stadt mode (default, issues #97, #98): the nine Stopps through the Stadt
// in number order — the Zentrum first as Stopp 0, then Viertel 01–08
// ("Stadt order", unlike Stadtplan/MiniStadtplan's own clockwise 3×3 reading
// order) — Label/Titel/Hinweis from the fixed `weg.leiste.*` dictionary
// keys, since there is only one Stadt to walk.
//
// Rundgang mode (issue #118): the Stationen of one specific Rundgang, in its
// own route order, each a Stopp or a Routen-Stopp (stationStopp above).
// Label and Titel come from the Rundgang itself — its title and description,
// since Figma's own worked example (T05, "Besuch im Zentrum") types ad hoc
// copy here ("Stadtplatz · Viertel 01–08") that doesn't trace to any
// Rundgang field, and predates the placeholder content issue #116 settled
// on. Hinweis is optional and empty on every current Rundgang-Übersicht: a
// Rundgang-Übersicht has no "current position" to report.
function WegLeiste(props: WegLeisteProps) {
	if (props.mode === 'rundgang') {
		const { mode: _mode, rundgang, stationen, hinweis, className, ...rest } = props
		return (
			<WegLeisteShell
				navigationLabel={t('rundgang.routeHeading')}
				label={rundgang.title}
				titel={rundgang.description}
				hinweis={hinweis}
				className={className}
				{...rest}
			>
				{stationen.map((station) => stationStopp(station))}
			</WegLeisteShell>
		)
	}

	const { mode: _mode, viertel, zentrum, aktuellId, className, ...rest } = props
	const aktuellNummer =
		zentrum && aktuellId === zentrum.id
			? 0
			: (viertel.find((item) => item.id === aktuellId)?.number ?? 0)

	return (
		<WegLeisteShell
			navigationLabel={t('stadt.navigation')}
			label={t('weg.leiste.label')}
			titel={t('weg.leiste.titel')}
			hinweis={t('weg.leiste.hinweis', { number: aktuellNummer })}
			className={className}
			{...rest}
		>
			{zentrum && stoppFor(zentrum, 0, aktuellId)}
			{viertel.map((item) => stoppFor(item, item.number, aktuellId))}
		</WegLeisteShell>
	)
}

export { stationStopp, WegLeiste }
