import AdmZip from 'adm-zip'
import multer from 'multer'
import {z} from 'zod'
import {type IConfig, type IReq, type IRes} from './types.ts'

const EPUB_MIMETYPE = 'application/epub+zip'
const MAX_EPUB_SIZE = 100 * 1024 * 1024 // 100MB (per the spec)

export const setupUploadEbook = (config: IConfig & {upload: multer.Multer}) =>
	config.app.post(config.route, config.upload.single('files'), async (req: IReq, res: IRes) => {
		const validationResult = EbookUploadSchema.safeParse(req.file)

		if (!validationResult.success)
			return res.status(400).json({
				error: 'Invalid file uploaded.',
				details: validationResult.error.flatten().fieldErrors,
			})

		const file = validationResult.data

		config.state.zip = new AdmZip(Buffer.from(await file.arrayBuffer()))

		const [files, dirs] = config.state.zip
			.getEntries()
			.reduce(
				(lrFilter, entry) => (
					lrFilter[entry.isDirectory ? 1 : 0].push(entry.entryName), lrFilter
				),
				[[], []] as [string[], string[]]
			)

		// set asset directory (ensuring that it is a unique name that does not exist in the epub)
		let i = 0
		const getAssetDir = () => `kindle-accessible${i ? `-${i}` : ''}/`
		while (dirs.includes('OEBPS/' + getAssetDir())) i += 1
		config.state.assetDir = getAssetDir()

		// return data
		const htmlFiles = files.filter(file => file.endsWith('html'))
		if (htmlFiles.length)
			return res.status(200).json({assetDir: config.state.assetDir, files: htmlFiles})

		res.status(500).json({
			error: 'Did not find any text files.',
			debug: {filePaths: config.state.zip.getEntries().map(entry => entry.entryName)},
		})
	})

const EbookUploadSchema = z
	.object({
		fieldname: z.string(),
		originalname: z.string(),
		encoding: z.string(),
		mimetype: z.string(),
		size: z.number(),
		buffer: z.instanceof(Buffer),
	})
	.refine(obj => [EPUB_MIMETYPE, 'application/octet-stream'].includes(obj.mimetype), {
		message: 'Invalid file type.',
	})
	.refine(obj => obj.size <= MAX_EPUB_SIZE, {message: 'File size should not exceed 100MB'})
	.transform(obj => new File([obj.buffer as BlobPart], obj.originalname, {type: obj.mimetype}))
