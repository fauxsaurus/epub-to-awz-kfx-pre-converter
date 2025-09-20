import type {FN} from '../../lib/types'

type IInputProps = {
	label: string
	onChange: FN<[string]>
	optional?: boolean
	placeholder: string
	value: string
}

export const TextInput = (props: IInputProps) => {
	return (
		<label>
			{props.label}:
			<input
				onChange={event => props.onChange(event.currentTarget.value)}
				placeholder={props.placeholder}
				type="text"
				value={props.value}
			/>
			{props.optional && '(Optional)'}
		</label>
	)
}
