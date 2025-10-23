// utils/formUtils.ts
import type { FormElement, FormElementType, DragItem } from '@/types/formBuilder.ts';

/**
 * Generate a unique ID for form elements
 */
export function generateId(): string {
    return `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a default form element of the specified type
 */
export function createDefaultElement(type: FormElementType): FormElement {
    const baseElement = {
        id: generateId(),
        type,
        label: getDefaultLabel(type),
        name: `field_${Date.now()}`,
        required: false,
        order: 0,
    };

    switch (type) {
        case 'text':
        case 'email':
        case 'password':
        case 'textarea':
            return {
                ...baseElement,
                type,
                placeholder: `Enter ${getDefaultLabel(type).toLowerCase()}`,
            } as any;

        case 'number':
        case 'range':
            return {
                ...baseElement,
                type,
                min: 0,
                max: 100,
                step: 1,
            } as any;

        case 'date':
        case 'datetime':
        case 'time':
            return {
                ...baseElement,
                type,
            } as any;

        case 'select':
        case 'radio':
            return {
                ...baseElement,
                type,
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                ],
                multiple: false,
            } as any;

        case 'checkbox':
            return {
                ...baseElement,
                type,
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                ],
                multiple: true,
            } as any;

        default:
            return baseElement as any;
    }
}

/**
 * Get default label for element type
 */
function getDefaultLabel(type: FormElementType): string {
    const labels: Record<FormElementType, string> = {
        text: 'Text Field',
        email: 'Email Field',
        password: 'Password Field',
        textarea: 'Text Area',
        number: 'Number Field',
        range: 'Range Slider',
        date: 'Date Picker',
        datetime: 'Date Time Picker',
        time: 'Time Picker',
        select: 'Select Dropdown',
        radio: 'Radio Button Group',
        checkbox: 'Checkbox Group',
    };

    return labels[type] || 'Form Field';
}

/**
 * Available drag items for the toolbar
 */
export const DRAG_ITEMS: DragItem[] = [
    { type: 'text', label: 'Text Field', icon: 'mdi-form-textbox' },
    { type: 'email', label: 'Email', icon: 'mdi-email' },
    { type: 'password', label: 'Password', icon: 'mdi-lock' },
    { type: 'textarea', label: 'Text Area', icon: 'mdi-text' },
    { type: 'number', label: 'Number', icon: 'mdi-numeric' },
    { type: 'range', label: 'Range', icon: 'mdi-tune' },
    { type: 'date', label: 'Date', icon: 'mdi-calendar' },
    { type: 'datetime', label: 'Date Time', icon: 'mdi-calendar-clock' },
    { type: 'time', label: 'Time', icon: 'mdi-clock' },
    { type: 'select', label: 'Select', icon: 'mdi-form-dropdown' },
    { type: 'radio', label: 'Radio Group', icon: 'mdi-radiobox-marked' },
    { type: 'checkbox', label: 'Checkbox Group', icon: 'mdi-checkbox-marked' },
];

/**
 * Validate field name format
 */
export function isValidFieldName(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Sanitize field name
 */
export function sanitizeFieldName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/^[0-9]/, 'field_$&')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}
