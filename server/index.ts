import dotenv from 'dotenv'
import fs from 'fs'
import {setupServer} from './setupServer.ts'

dotenv.config()

const cert = fs.readFileSync(process.env.SSL_CERT_PATH!)
const key = fs.readFileSync(process.env.SSL_KEY_PATH!)

setupServer({cert, key, logger: console.log, port: 3000, state: {assetDir: ''}})
