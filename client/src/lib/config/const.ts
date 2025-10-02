import type {IConfig} from './types'

const info = `For use with https://github.com/fauxsaurus/epub-to-awz-kfx-pre-converter.`

export const DEFAULT_CONFIG: IConfig = {
	css: {pre: '', post: ''},
	img: [],
	meta: {info, version: 1},
}

export const CONFIG_IMG_TEMPLATE: IConfig['img'][number] = {
	alt: '',
	class: 'kindle-accessible-image',
	content: '',
}
