import {type IConfig, type IRes} from './types.ts'

const EPUB_MIMETYPE = 'application/epub+zip'

export const setupDownloadEbook = (config: IConfig) =>
	config.app.get(config.route, async (_, res: IRes) => {
		if (!config.state.zip) return res.status(404)

		const downloadName = 'kindle-accessible.epub'
		const buffer = config.state.zip.toBuffer()

		res.set('Content-Type', EPUB_MIMETYPE)
		res.set('Content-Disposition', `attachment; filename=${downloadName}`)
		res.set('Content-Length', buffer.byteLength + '')

		res.send(buffer)
	})
