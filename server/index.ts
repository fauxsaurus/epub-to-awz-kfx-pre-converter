import AdmZip from 'adm-zip'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'
import https from 'https'
import multer from 'multer'

import {ROUTES} from '../shared/routes.ts'
import {setupDownloadEbook} from './routes/download-ebook.ts'
import {setupUploadEbook} from './routes/upload-ebook.ts'
import {setupUploadFiles} from './routes/upload-files.ts'
import {setupFileRouting} from './routes/file-routing.ts'

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
setupFileRouting({app, state})

// --- Start the Server ---
https.createServer(options, app).listen(port, '0.0.0.0', () => {
	console.log(`Server is listening on https://localhost:${port}`)
})
