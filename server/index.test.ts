import {exec} from 'child_process'
import {promises} from 'fs'
import {getFile, uploadFiles} from '../client/src/lib/request'
import {ROUTES} from '../shared/routes'
import {EPUB_MIMETYPE} from '../shared/mimetype'
import {setupServer} from './setupServer'

const PORT = 3000
const baseUrl = `http://localhost:${PORT}`

describe('Test Routes', () => {
	const cleanup = setupServer({logger: console.log, port: PORT, state: {assetDir: ''}})

	it('Has a Cleanup Function', () => {
		expect(cleanup).toBeInstanceOf(Function)
	})

	test('ebook setup', async () => {
		await new Promise((resolve, reject) => {
			exec('./scripts/setup-tests.sh', (error, stdout, stderr) => {
				if (error) return reject(error)

				resolve({stdout, stderr})
			})
		})

		const buffer = await promises.readFile('./tmp/build/test.epub')
		const uploadedEbookBlob = new Blob([buffer as BlobPart], {type: EPUB_MIMETYPE})

		/** @note TEST upload ebook */
		const responseUploadEbook = await uploadFiles(baseUrl + ROUTES.uploadEbook, {}, [
			['test-ebook.epub', uploadedEbookBlob],
		])
		expect(responseUploadEbook).toEqual({
			data: {assetDir: 'kindle-accessible/', files: ['index.html']},
			errors: [],
		})

		/** @note download unaltered ebook */
		const responseDownloadEbook = await getFile(baseUrl + ROUTES.downloadEbook)
		const downloadedEbookBlob = await responseDownloadEbook.data?.blob()

		expect(downloadedEbookBlob?.size).toBe(uploadedEbookBlob.size)

		setTimeout(() => cleanup(), 0)
	})
})
