import { cn } from 'cn'
import Link from 'next/link'
import * as React from 'react'

import { Illustration } from '@/components/ui/illustration'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { t } from '@/lib/dictionary'
import { formatTwoDigits } from '@/lib/utils/format-two-digits'

interface ThemenWegAbschnittItem {
	readonly id: string
	readonly url: string
	readonly number: string
	readonly title: string
	readonly current: boolean
}

interface ThemenWegKapitelItem {
	readonly id: string
	readonly url: string
	readonly number: number
	readonly title: string
	readonly viertelId: string
	readonly viertelNumber: number
	readonly viertelTitle: string
	readonly current: boolean
	// Set only for the current Kapitel on an Abschnitt page (Ansicht=Abschnitt,
	// Figma 36590:9190): it expands to this list instead of being marked
	// active itself, with the current Abschnitt marked inside it.
	readonly abschnitte?: readonly ThemenWegAbschnittItem[]
}

interface ThemenWegProps extends React.ComponentProps<'div'> {
	readonly leitthemaTitle: string
	readonly kapitel: readonly ThemenWegKapitelItem[]
}

// Between two Kapitel rows (Figma 36531:11523): `status` always "offen" since
// no reading state exists yet (issue #99), kept as a real prop so a later
// issue can pass "gelesen" without a new component. `ausrichtung` widens the
// connector next to the expanded, current Kapitel.
function WegLinie({
	status,
	ausrichtung,
}: {
	readonly status: 'offen' | 'gelesen'
	readonly ausrichtung: 'ausgeklappt' | 'eingeklappt'
}) {
	return (
		<li aria-hidden="true" className="flex justify-center py-1">
			<span
				data-slot="weg-linie"
				data-status={status}
				data-ausrichtung={ausrichtung}
				className="w-0.5 rounded-full bg-border data-[ausrichtung=ausgeklappt]:h-6 data-[ausrichtung=eingeklappt]:h-3 data-[status=gelesen]:bg-primary"
			/>
		</li>
	)
}

// The Themen-Weg sidebar (Figma 36590:9190, set on the kit Sidebar): every
// Kapitel of the Leitthema, the current one marked, connected by Weg-Linien
// (Figma 36531:11523). On an Abschnitt page the current Kapitel's own
// `abschnitte` expands it instead (Ansicht=Abschnitt) — issue #99. Plain data
// props, like EbenenLeiste: KapitelThemenWeg resolves them from the graph.
function ThemenWeg({ leitthemaTitle, kapitel, className, ...props }: ThemenWegProps) {
	return (
		<div data-slot="themen-weg" className={cn('flex flex-col', className)} {...props}>
			<SidebarGroup>
				<SidebarGroupLabel>{t('themenWeg.heading', { title: leitthemaTitle })}</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{kapitel.map((item, index) => (
							<React.Fragment key={item.id}>
								<SidebarMenuItem>
									<SidebarMenuButton
										render={<Link href={item.url} />}
										isActive={item.current && item.abschnitte === undefined}
										className="h-auto items-start gap-3 rounded-lg p-2.5"
									>
										<Illustration
											id={item.viertelId}
											label={item.viertelTitle}
											className="size-8 shrink-0"
										/>
										<span className="flex min-w-0 flex-col gap-0.5">
											<span className="truncate text-sm font-semibold">{item.title}</span>
											<span className="truncate text-xs text-muted-foreground">
												{t('themenWeg.kapitelLabel', {
													number: item.number,
													viertelNumber: formatTwoDigits(item.viertelNumber),
													viertelTitle: item.viertelTitle,
												})}
											</span>
										</span>
									</SidebarMenuButton>
									{item.abschnitte && (
										<SidebarMenuSub>
											{item.abschnitte.map((abschnitt) => (
												<SidebarMenuSubItem key={abschnitt.id}>
													<SidebarMenuSubButton
														render={<Link href={abschnitt.url} />}
														isActive={abschnitt.current}
													>
														{t('abschnitt.numberedTitle', {
															number: abschnitt.number,
															title: abschnitt.title,
														})}
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									)}
								</SidebarMenuItem>
								{index < kapitel.length - 1 && (
									<WegLinie
										status="offen"
										ausrichtung={
											item.abschnitte || kapitel[index + 1]?.abschnitte
												? 'ausgeklappt'
												: 'eingeklappt'
										}
									/>
								)}
							</React.Fragment>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</div>
	)
}

export { ThemenWeg, type ThemenWegAbschnittItem, type ThemenWegKapitelItem }
