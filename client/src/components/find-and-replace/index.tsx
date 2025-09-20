import {type IConfig} from '../../lib/config'
import type {FN} from '../../lib/types'
import {TextInput} from './text-input'

type Int = number

type IProps = {
	setState: FN<[IConfig['img']]>
	state: IConfig['img']
	validationErrors: string[][]
}

export const FindAndReplace = ({setState, state, validationErrors}: IProps) => {
	const setItemState = (i: number, newItemState: IConfig['img'][number]) => {
		if (newItemState.alt || newItemState.content)
			return setState(Object.assign(state.slice(), {[i]: newItemState}))

		// remove array item
		const newArray = state.slice()
		newArray.splice(i, 1)
		setState(newArray)
	}

	const setAlt = (i: Int, alt: string) => setItemState(i, {...state[i], alt})
	const setClass = (i: Int, className: string) => setItemState(i, {...state[i], class: className})
	const setContent = (i: Int, content: string) => setItemState(i, {...state[i], content})

	return state.map((itemState, i) => {
		return (
			<fieldset key={i}>
				<legend>Find and Replace Group {i + 1}</legend>
				{/** @note i may not exist on the validation errors (due to the template being stacked onto state) */}
				<ul data-validation="error" hidden={!validationErrors[i]?.length}>
					{validationErrors?.map((error, i) => (
						<li key={i}>{error}</li>
					))}
				</ul>
				<TextInput
					key="Content"
					label="Image Content"
					onChange={newValue => setContent(i, newValue)}
					placeholder="CSS Query"
					value={itemState.content}
				/>
				<TextInput
					key="Alt"
					label="Alt Text"
					onChange={newValue => setAlt(i, newValue)}
					optional={true}
					placeholder="CSS Query"
					value={itemState.alt || ''}
				/>
				<TextInput
					key="Class"
					label="Image Class"
					onChange={newValue => setClass(i, newValue)}
					optional={true}
					placeholder="HTML Class"
					value={itemState.class || ''}
				/>
			</fieldset>
		)
	})
}
