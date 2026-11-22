import { z } from 'zod'

// The first content type (ADR-0002). Each type gets its own schema here as the
// content layer grows.
export const seiteFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	shortTitle: z.string().min(1).optional(),
})

export type SeiteFrontmatter = z.infer<typeof seiteFrontmatterSchema>
