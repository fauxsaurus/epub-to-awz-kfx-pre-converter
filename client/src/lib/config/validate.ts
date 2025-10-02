import {z} from 'zod'
import {DEFAULT_CONFIG} from './const'

export const validateConfig = (json: unknown) => {
	const validationResult = configSchema.safeParse(json)
	if (!validationResult.success) return {data: DEFAULT_CONFIG, errors: ['Invalid Config']}

	return {data: validationResult.data, errors: []}
}

const configSchema = z.object({
	css: z.object({pre: z.string(), post: z.string()}),
	img: z.array(
		z.object({
			alt: z.string().optional(),
			class: z.string().optional(),
			content: z.string(),
		})
	),
	meta: z.object({info: z.string(), version: z.number()}),
})
