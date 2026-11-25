'use client'

import type * as React from 'react'

import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { t } from '@/lib/dictionary'

interface ThemenWegSheetProps extends React.ComponentProps<'div'> {
	kapitelCount: number
	// The Themen-Weg list, server-rendered by the caller (KapitelThemenWeg) and
	// handed down as already-resolved markup, so this Client Component never
	// imports the content graph itself (static-export.md).
	children: React.ReactNode
}

// The outline xs Button "Themen-Weg · N Kapitel" that opens the same
// Themen-Weg list from a Sheet on the left, replacing the sidebar below 1280
// (issues #99, #109). Base UI's Dialog gives Escape-to-close and focus-return to
// the trigger for free.
function ThemenWegSheet({ kapitelCount, children, className, ...props }: ThemenWegSheetProps) {
	return (
		<div data-slot="themen-weg-sheet" className={className} {...props}>
			<Sheet>
				<SheetTrigger render={<Button variant="outline" size="xs" />}>
					{t('themenWeg.trigger', { n: kapitelCount })}
				</SheetTrigger>
				<SheetContent side="left" className="w-3/4 gap-0 overflow-y-auto p-0 sm:max-w-xs">
					<SheetHeader className="sr-only">
						<SheetTitle>{t('themenWeg.sheetTitle')}</SheetTitle>
						<SheetDescription>{t('themenWeg.sheetDescription')}</SheetDescription>
					</SheetHeader>
					{children}
				</SheetContent>
			</Sheet>
		</div>
	)
}

export { ThemenWegSheet }
