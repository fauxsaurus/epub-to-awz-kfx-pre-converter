import {exec} from 'child_process'
import {promises} from 'fs'
import {uploadFiles} from '../client/src/lib/request'
import {ROUTES} from '../shared/routes'
import {EPUB_MIMETYPE} from '../shared/mimetype'
import {setupServer} from './setupServer'

const PORT = 3000

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
		const blob = new Blob([buffer as BlobPart], {type: EPUB_MIMETYPE})

		const url = `http://localhost:${PORT}${ROUTES.uploadEbook}`
		const responseUploadEbook = await uploadFiles(url, {}, [['test-ebook.epub', blob]])
		expect(responseUploadEbook).toEqual({
			data: {assetDir: 'kindle-accessible/', files: ['index.html']},
			errors: [],
		})

		setTimeout(() => cleanup(), 0)
	})
})
