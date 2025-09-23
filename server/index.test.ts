import {setupServer} from './setupServer'

describe('Test Routes', () => {
	const cleanup = setupServer({logger: console.log, port: 3000, state: {assetDir: ''}})

	it('Has a Cleanup Function', () => {
		expect(cleanup).toBeInstanceOf(Function)
	})

	setTimeout(() => cleanup(), 0)
})
