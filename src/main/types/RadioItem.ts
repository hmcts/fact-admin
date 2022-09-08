export interface RadioItem {
  id: number | string,
  value: string,
  text: string,
  checked?: boolean
  attributes? : Attribute
}

// attributes: { 'data-inputType': 'cases-heard', 'aria-checked': checked, 'data-id': areaOfLaw.id },

export interface Attribute {
  'data-name'?: string,
}
