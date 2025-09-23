import mime from 'mime-types'
import path from 'path'
import {type IConfig, type IReq, type IRes} from './types.ts'

export const setupFileRouting = (config: Pick<IConfig, 'app' | 'state'>) => {
	/** @note serve index.html */
	config.app.get('/', (_, res) =>
		res
			.status(200)
			.setHeader('Content-Type', 'text/html')
			.sendFile(path.join(process.cwd(), `/client/dist/index.html`))
	)

	/** @note Serves epub files directly from zip (and client assets). */
	config.app.get('/*filepath', async (req: IReq, res: IRes) => {
		const filePath = (req.params.filepath as unknown as []).join('/') || 'index.html'
		const mimeType = mime.lookup(filePath.split('/').slice(-1)[0])

		/** @note serve client files */
		if (!filePath.includes('/') || filePath.startsWith('assets/'))
			return res
				.status(200)
				.setHeader('Content-Type', mimeType)
				.sendFile(path.join(process.cwd(), `/client/dist/${filePath}`))

		const zipEntry = config.state.zip?.getEntry(filePath)
		if (!zipEntry) return res.status(404).json({error: `File "${filePath}" not found.`})

		res.status(200).setHeader('Content-Type', mimeType).send(zipEntry.getData())
	})
}
