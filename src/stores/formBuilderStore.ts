// stores/form-builder.ts
import { defineStore } from 'pinia';
import type {FormSchema, FormElement, ValidationRule, FormElementType} from '@/types/formBuilder.ts';
import { generateId, createDefaultElement } from '@/utils/formUtils.ts';

interface FormBuilderState {
    currentSchema: FormSchema | null;
    selectedElement: FormElement | null;
    isDragging: boolean;
    validationErrors: ValidationRule[];
    previewMode: boolean;
}

export const useFormBuilderStore = defineStore('formBuilder', {
    state: (): FormBuilderState => ({
        currentSchema: null,
        selectedElement: null,
        isDragging: false,
        validationErrors: [],
        previewMode: false,
    }),

    getters: {
        /**
         * Get sorted form elements by order
         */
        sortedElements: (state): FormElement[] => {
            if (!state.currentSchema) return [];
            return [...state.currentSchema.elements].sort((a, b) => a.order - b.order);
        },

        /**
         * Check if form has any elements
         */
        hasElements: (state): boolean => {
            // Use nullish coalescing to avoid error on undefined .length
            return (state.currentSchema?.elements.length ?? 0) > 0;
        },

        /**
         * Get form as JSON Schema format
         */
        jsonSchema: (state): object | null => {
            if (!state.currentSchema) return null;

            const properties: Record<string, any> = {};
            const required: string[] = [];

            state.currentSchema.elements.forEach(element => {
                const property: any = {
                    type: getJsonSchemaType(element.type),
                    title: element.label,
                };

                if (element.description) {
                    property.description = element.description;
                }

                // Add type-specific constraints
                if (element.type === 'text' || element.type === 'email' || element.type === 'password') {
                    const textElement = element as any;
                    if (textElement.minLength) property.minLength = textElement.minLength;
                    if (textElement.maxLength) property.maxLength = textElement.maxLength;
                    if (textElement.pattern) property.pattern = textElement.pattern;
                    if (textElement.defaultValue) property.default = textElement.defaultValue;
                }

                if (element.type === 'number') {
                    const numberElement = element as any;
                    if (numberElement.min !== undefined) property.minimum = numberElement.min;
                    if (numberElement.max !== undefined) property.maximum = numberElement.max;
                    if (numberElement.defaultValue !== undefined) property.default = numberElement.defaultValue;
                }

                if (element.type === 'select' || element.type === 'radio') {
                    const selectElement = element as any;
                    property.enum = selectElement.options.map((opt: any) => opt.value);
                    if (selectElement.defaultValue) property.default = selectElement.defaultValue;
                }

                properties[element.name] = property;

                if (element.required) {
                    required.push(element.name);
                }
            });

            return {
                type: 'object',
                title: state.currentSchema.title,
                description: state.currentSchema.description,
                properties,
                required,
            };
        },
    },

    actions: {
        /**
         * Initialize a new form schema
         */
        createNewForm(title: string, description?: string) {
            this.currentSchema = {
                id: generateId(),
                title,
                description,
                elements: [],
                created: new Date(),
                updated: new Date(),
            };
        },

        /**
         * Add a new form element
         */
        addElement(type: FormElementType, position?: number) {
            if (!this.currentSchema) return;

            const element = createDefaultElement(type);
            element.order = position ?? this.currentSchema.elements.length;

            // Adjust orders if inserting in middle
            if (position !== undefined) {
                this.currentSchema.elements
                    .filter(el => el.order >= position)
                    .forEach(el => el.order++);
            }

            this.currentSchema.elements.push(element);
            this.currentSchema.updated = new Date();
            this.selectedElement = element;
        },

        /**
         * Update an existing form element
         */
        updateElement(elementId: string, updates: Partial<FormElement>) {
            if (!this.currentSchema) return;

            const index = this.currentSchema.elements.findIndex(el => el.id === elementId);
            if (index !== -1) {
                // Cast the result to FormElement to satisfy TypeScript's discriminated union
                this.currentSchema.elements[index] = {
                    ...this.currentSchema.elements[index],
                    ...updates,
                } as FormElement;
                this.currentSchema.updated = new Date();
            }
        },

        /**
         * Remove a form element
         */
        removeElement(elementId: string) {
            if (!this.currentSchema) return;

            const elementIndex = this.currentSchema.elements.findIndex(el => el.id === elementId);
            if (elementIndex === -1) return;

            // Get the element and check if it exists before accessing .order
            const element = this.currentSchema.elements[elementIndex];
            if (!element) return;

            const elementOrder = element.order;
            // Remove element
            this.currentSchema.elements.splice(elementIndex, 1);

            // Adjust remaining orders
            this.currentSchema.elements
                .filter(el => el.order > elementOrder)
                .forEach(el => el.order--);

            this.currentSchema.updated = new Date();

            if (this.selectedElement?.id === elementId) {
                this.selectedElement = null;
            }
        },

        /**
         * Reorder elements via drag and drop
         */
        reorderElement(elementId: string, newOrder: number) {
            if (!this.currentSchema) return;

            const element = this.currentSchema.elements.find(el => el.id === elementId);
            if (!element) return;

            const oldOrder = element.order;

            if (oldOrder < newOrder) {
                // Moving down - decrement orders between old and new position
                this.currentSchema.elements
                    .filter(el => el.order > oldOrder && el.order <= newOrder)
                    .forEach(el => el.order--);
            } else if (oldOrder > newOrder) {
                // Moving up - increment orders between new and old position
                this.currentSchema.elements
                    .filter(el => el.order >= newOrder && el.order < oldOrder)
                    .forEach(el => el.order++);
            }

            element.order = newOrder;
            this.currentSchema.updated = new Date();
        },

        /**
         * Select an element for editing
         */
        selectElement(elementId: string | null) {
            if (!elementId) {
                this.selectedElement = null;
                return;
            }

            const element = this.currentSchema?.elements.find(el => el.id === elementId);
            this.selectedElement = element || null;
        },

        /**
         * Toggle preview mode
         */
        togglePreviewMode() {
            this.previewMode = !this.previewMode;
            if (this.previewMode) {
                this.selectedElement = null;
            }
        },

        /**
         * Export form as JSON Schema
         */
        exportToJsonSchema(): string {
            return JSON.stringify(this.jsonSchema, null, 2);
        },

        /**
         * Import form from JSON Schema
         */
        importFromJsonSchema(jsonSchemaString: string) {
            try {
                const jsonSchema = JSON.parse(jsonSchemaString);

                const elements: FormElement[] = [];
                let order = 0;

                for (const [fieldName, fieldSchema] of Object.entries(jsonSchema.properties || {})) {
                    const schema = fieldSchema as any;
                    const element = createElementFromJsonSchema(fieldName, schema, order++);

                    if (jsonSchema.required?.includes(fieldName)) {
                        element.required = true;
                    }

                    elements.push(element);
                }

                this.currentSchema = {
                    id: generateId(),
                    title: jsonSchema.title || 'Imported Form',
                    description: jsonSchema.description,
                    elements,
                    created: new Date(),
                    updated: new Date(),
                };

                return true;
            } catch (error) {
                console.error('Failed to import JSON Schema:', error);
                return false;
            }
        },

        /**
         * Validate current form
         */
        validateForm(): boolean {
            this.validationErrors = [];

            if (!this.currentSchema) return false;

            // Check for duplicate field names
            const names = new Set<string>();
            for (const element of this.currentSchema.elements) {
                if (names.has(element.name)) {
                    this.validationErrors.push({
                        field: element.id,
                        rule: 'unique',
                        message: `Field name "${element.name}" must be unique`,
                    });
                }
                names.add(element.name);
            }

            // Validate individual elements
            for (const element of this.currentSchema.elements) {
                if (!element.name.trim()) {
                    this.validationErrors.push({
                        field: element.id,
                        rule: 'required',
                        message: 'Field name is required',
                    });
                }

                if (!element.label.trim()) {
                    this.validationErrors.push({
                        field: element.id,
                        rule: 'required',
                        message: 'Field label is required',
                    });
                }
            }

            return this.validationErrors.length === 0;
        },
    },
});

/**
 * Helper function to convert form element type to JSON Schema type
 */
function getJsonSchemaType(elementType: string): string {
    switch (elementType) {
        case 'number':
        case 'range':
            return 'number';
        case 'date':
        case 'datetime':
        case 'time':
            return 'string';
        case 'checkbox':
            return 'boolean';
        default:
            return 'string';
    }
}

/**
 * Helper function to create form element from JSON Schema
 */
function createElementFromJsonSchema(fieldName: string, schema: any, order: number): FormElement {
    let type: FormElementType = 'text';

    // Determine element type from schema
    if (schema.type === 'number') {
        type = 'number';
    } else if (schema.type === 'boolean') {
        type = 'checkbox';
    } else if (schema.enum) {
        type = 'select';
    } else if (schema.format === 'date') {
        type = 'date';
    } else if (schema.format === 'email') {
        type = 'email';
    }

    const baseElement = createDefaultElement(type);
    baseElement.name = fieldName;
    baseElement.label = schema.title || fieldName;
    baseElement.description = schema.description;
    baseElement.order = order;

    // Apply type-specific properties
    if (type === 'text' || type === 'email') {
        const textElement = baseElement as any;
        if (schema.minLength) textElement.minLength = schema.minLength;
        if (schema.maxLength) textElement.maxLength = schema.maxLength;
        if (schema.pattern) textElement.pattern = schema.pattern;
        if (schema.default) textElement.defaultValue = schema.default;
    }

    if (type === 'number') {
        const numberElement = baseElement as any;
        if (schema.minimum !== undefined) numberElement.min = schema.minimum;
        if (schema.maximum !== undefined) numberElement.max = schema.maximum;
        if (schema.default !== undefined) numberElement.defaultValue = schema.default;
    }

    if (type === 'select') {
        const selectElement = baseElement as any;
        selectElement.options = schema.enum?.map((value: any) => ({
            value: String(value),
            label: String(value),
        })) || [];
        if (schema.default) selectElement.defaultValue = schema.default;
    }

    return baseElement;
}
