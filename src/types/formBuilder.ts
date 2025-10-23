// types/formBuilder.ts
export interface FormElementBase {
    id: string;
    type: FormElementType;
    label: string;
    name: string;
    required: boolean;
    placeholder?: string;
    description?: string;
    order: number;
}

export interface TextFieldElement extends FormElementBase {
    type: 'text' | 'email' | 'password' | 'textarea';
    minLength?: number;
    maxLength?: number;
    pattern?: string; // regex pattern
    defaultValue?: string;
}

export interface NumberFieldElement extends FormElementBase {
    type: 'number' | 'range';
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
}

export interface DateFieldElement extends FormElementBase {
    type: 'date' | 'datetime' | 'time';
    min?: string;
    max?: string;
    defaultValue?: string;
}

export interface SelectFieldElement extends FormElementBase {
    type: 'select' | 'radio' | 'checkbox';
    options: Array<{ value: string; label: string }>;
    multiple?: boolean;
    defaultValue?: string | string[];
}

export type FormElement =
    | TextFieldElement
    | NumberFieldElement
    | DateFieldElement
    | SelectFieldElement;

export type FormElementType =
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'number'
    | 'range'
    | 'date'
    | 'datetime'
    | 'time'
    | 'select'
    | 'radio'
    | 'checkbox';

export interface FormSchema {
    id: string;
    title: string;
    description?: string;
    elements: FormElement[];
    created: Date;
    updated: Date;
}

export interface ValidationRule {
    field: string;
    rule: string;
    message: string;
    value?: any;
}

export interface DragItem {
    type: FormElementType;
    label: string;
    icon: string;
}
