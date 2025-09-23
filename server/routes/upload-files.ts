import multer from 'multer'
import {z} from 'zod'
import {type IConfig, type IReq, type IRes} from './types.ts'

export const setupUploadFiles = (config: IConfig & {upload: multer.Multer}) =>
	config.app.post(config.route, config.upload.array('files'), async (req: IReq, res: IRes) => {
		if (!config.state.zip) return res.status(428).json({error: 'Upload an eBook first.'})

		const validationResult = z.array(FilesUploadSchema).safeParse(req.files)
		if (!validationResult.success)
			return res.status(400).json({
				error: 'Invalid file(s) uploaded.',
				details: validationResult.error.flatten().fieldErrors,
			})

		const files = validationResult.data
		const newFileNames = files.map(file => file.originalname)
		const oldFileNames = config.state.zip
			.getEntries()
			.map(entry => entry.entryName.split('/').slice(-1)[0])

		newFileNames.map((newFileName, newFileI) => {
			const {buffer} = files[newFileI]
			const oldEntryI = oldFileNames.indexOf(newFileName)

			// insert file
			if (oldEntryI === -1)
				return void config.state.zip!.addFile(
					`OEBPS/${config.state.assetDir}${newFileName}`,
					buffer
				)

			// update file
			const fullPath = config.state.zip!.getEntries()[oldEntryI].entryName

			config.state.zip!.updateFile(fullPath, buffer)
		})

		res.status(200).json({filesUpdated: true})
	})

const FilesUploadSchema = z.object({
	fieldname: z.string(),
	originalname: z.string(),
	encoding: z.string(),
	mimetype: z.string(),
	size: z.number(),
	buffer: z.instanceof(Buffer),
})
