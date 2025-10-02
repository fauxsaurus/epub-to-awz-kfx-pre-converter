/**
 * @jest-environment jsdom
 */

describe('Browser-specific tests', () => {
	test('should interact with the DOM', () => {
		document.body.innerHTML = '<h1>Hello</h1>'
		expect(document.querySelector('h1')?.textContent).toBe('Trello')
	})
})
