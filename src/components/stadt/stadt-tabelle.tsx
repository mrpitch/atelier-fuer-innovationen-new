import { cn } from 'cn'
import Link from 'next/link'
import type * as React from 'react'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { t } from '@/lib/dictionary'

import { SectionTitle } from './section-title'
import type { StadtTabelleCell, StadtTabelleData } from './stadt-tabelle-rows'

function renderCell(data: StadtTabelleCell) {
	return data.href ? <Link href={data.href}>{data.label}</Link> : data.label
}

interface StadtTabelleProps extends React.ComponentProps<'div'> {
	data: StadtTabelleData
}

// "Was in jedem Viertel liegt" (Figma T08 "Alle Viertel im Überblick"
// frame, issue #95): the Zentrum then Viertel 01–08, each row naming its
// Ort, Station in the Schauen Rundgang, Kapitel in the Leitthema and
// Themen-Ort — `data` is already resolved against the graph (StadtplanHub),
// so this component only renders it.
function StadtTabelle({ data, className, ...props }: StadtTabelleProps) {
	return (
		<div data-slot="stadt-tabelle" className={cn('flex flex-col gap-10', className)} {...props}>
			<SectionTitle
				tagline={t('stadt.hub.tabelleTagline')}
				title={t('stadt.hub.tabelleTitle')}
				description={t('stadt.hub.tabelleDescription')}
			/>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t('stadt.hub.tabelleOrtHeading')}</TableHead>
						<TableHead>{data.headings.station}</TableHead>
						<TableHead>{data.headings.kapitel}</TableHead>
						<TableHead>{t('stadt.hub.tabelleThemenOrtHeading')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.rows.map((row) => (
						<TableRow key={row.key}>
							<TableCell>{renderCell(row.ort)}</TableCell>
							<TableCell>{renderCell(row.station)}</TableCell>
							<TableCell>{renderCell(row.kapitel)}</TableCell>
							<TableCell>{renderCell(row.themenOrt)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

export { StadtTabelle }
