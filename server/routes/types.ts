import AdmZip from 'adm-zip'
import {type Express, type Request, type Response} from 'express'

export type IReq = Request
export type IRes = Response

/** @note file or url path */
type IPath = string

export type IConfig = {
	app: Express
	route: IPath
	state: {assetDir: IPath; zip?: AdmZip}
}
