import {z} from 'zod'
import {DEFAULT_CONFIG} from './const'
import type {IConfig, ICssQuery} from './types'

/** @note Schema Validation */
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

/** @note replacement validation */
export const validateReplacementConfig = (img: IConfig['img']) =>
	img.map(replacementText => {
		const validationErrors = []

		if (!replacementText.content || !validateCssQuery(replacementText.content))
			validationErrors.push('Need a valid CSS query for Image Text.')

		if (replacementText.alt && !validateCssQuery(replacementText.alt))
			validationErrors.push('Invalid Alt Text CSS Query.')

		return validationErrors
	})

const validateCssQuery = (query: ICssQuery) => {
	try {
		document.querySelector(query)
		return true
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		return false
	}
}
