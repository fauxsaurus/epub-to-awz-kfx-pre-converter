import express from 'express'
import http from 'http'
import https from 'https'
import multer from 'multer'

import {type FN} from '../shared/types.ts'
import {ROUTES} from '../shared/routes.ts'
import {setupDownloadEbook} from './routes/download-ebook.ts'
import {setupUploadEbook} from './routes/upload-ebook.ts'
import {setupUploadFiles} from './routes/upload-files.ts'
import {setupFileRouting} from './routes/file-routing.ts'
import {type IConfig, type IReq} from './routes/types.ts'

type IParam = {
	cert?: NonSharedBuffer
	key?: NonSharedBuffer
	logger: FN<[unknown]>
	port: number
	state: IConfig['state']
}

export const setupServer = ({cert, key, logger, port, state}: IParam) => {
	const app = express()
	const upload = multer({storage: multer.memoryStorage()})

	const secure = cert && key
	const server = secure ? https.createServer({cert, key}, app) : http.createServer({}, app)

	setupLogger({app, logger})
	setupUploadEbook({app, route: ROUTES.uploadEbook, state, upload})
	setupUploadFiles({app, route: ROUTES.uploadFiles, state, upload})
	setupDownloadEbook({app, route: ROUTES.downloadEbook, state})
	setupFileRouting({app, state})

	server.listen(port, '0.0.0.0', () => logger(`Server is listening on https://localhost:${port}`))

	return () => new Promise((res, rej) => server.close(error => (error ? rej(error) : res(null))))
}

const req2log = (req: IReq) => `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`

const setupLogger = (config: {app: IConfig['app']; logger: FN<[unknown]>}) =>
	config.app.use((req, _, next) => (config.logger(req2log(req)), next()))
