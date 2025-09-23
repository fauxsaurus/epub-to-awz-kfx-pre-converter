import AdmZip from 'adm-zip'
import dotenv from 'dotenv'
import express, {type Request, type Response} from 'express'
import fs from 'fs'
import https from 'https'
import mime from 'mime-types'
import multer from 'multer'
import path from 'path'

import {ROUTES} from '../shared/routes.ts'
import {setupDownloadEbook} from './routes/download-ebook.ts'
import {setupUploadEbook} from './routes/upload-ebook.ts'
import {setupUploadFiles} from './routes/upload-files.ts'

dotenv.config()

const app = express()
const options = {
	key: fs.readFileSync(process.env.SSL_KEY_PATH!),
	cert: fs.readFileSync(process.env.SSL_CERT_PATH!),
}

const port = 3000

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

const state: {assetDir: string; zip?: AdmZip} = {assetDir: ''}

app.use((req, _, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
	next()
})

setupUploadEbook({app, route: ROUTES.uploadEbook, state, upload})
setupUploadFiles({app, route: ROUTES.uploadFiles, state, upload})
setupDownloadEbook({app, route: ROUTES.downloadEbook, state})

/** @note server index.html */
app.get('/', (_, res) =>
	res
		.status(200)
		.setHeader('Content-Type', 'text/html')
		.sendFile(path.join(process.cwd(), `/client/dist/index.html`))
)

/** @note Serves epub files directly from zip. */
app.get('/*filepath', async (req: Request, res: Response) => {
	const filePath = (req.params.filepath as unknown as []).join('/') || 'index.html'
	const mimeType = mime.lookup(filePath.split('/').slice(-1)[0])

	/** @note serve client files */
	if (!filePath.includes('/') || filePath.startsWith('assets/'))
		return res
			.status(200)
			.setHeader('Content-Type', mimeType)
			.sendFile(path.join(process.cwd(), `/client/dist/${filePath}`))

	const zipEntry = state.zip?.getEntry(filePath)
	if (!zipEntry) return res.status(404).json({error: `File "${filePath}" not found.`})

	res.status(200).setHeader('Content-Type', mimeType).send(zipEntry.getData())
})

// --- Start the Server ---
https.createServer(options, app).listen(port, '0.0.0.0', () => {
	console.log(`Server is listening on https://localhost:${port}`)
})
