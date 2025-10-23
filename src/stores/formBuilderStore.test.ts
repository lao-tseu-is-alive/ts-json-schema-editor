import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFormBuilderStore } from './formBuilderStore';
import type { FormElement, FormElementType } from '@/types/formBuilder';

describe('formBuilderStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with null schema', () => {
      const store = useFormBuilderStore();
      expect(store.currentSchema).toBeNull();
    });

    it('should initialize with no selected element', () => {
      const store = useFormBuilderStore();
      expect(store.selectedElement).toBeNull();
    });

    it('should initialize with dragging false', () => {
      const store = useFormBuilderStore();
      expect(store.isDragging).toBe(false);
    });

    it('should initialize with empty validation errors', () => {
      const store = useFormBuilderStore();
      expect(store.validationErrors).toEqual([]);
    });

    it('should initialize with preview mode false', () => {
      const store = useFormBuilderStore();
      expect(store.previewMode).toBe(false);
    });
  });

  describe('createNewForm', () => {
    it('should create a new form with title', () => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');

      expect(store.currentSchema).not.toBeNull();
      expect(store.currentSchema?.title).toBe('Test Form');
      expect(store.currentSchema?.elements).toEqual([]);
    });

    it('should create a new form with title and description', () => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form', 'Test Description');

      expect(store.currentSchema?.title).toBe('Test Form');
      expect(store.currentSchema?.description).toBe('Test Description');
    });

    it('should set created and updated dates', () => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');

      expect(store.currentSchema?.created).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(store.currentSchema?.updated).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    });

    it('should generate unique form ID', () => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form 1');
      const id1 = store.currentSchema?.id;

      store.createNewForm('Test Form 2');
      const id2 = store.currentSchema?.id;

      expect(id1).not.toBe(id2);
    });
  });

  describe('addElement', () => {
    beforeEach(() => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
    });

    it('should add element to empty form', () => {
      const store = useFormBuilderStore();
      store.addElement('text');

      expect(store.currentSchema?.elements).toHaveLength(1);
      expect(store.currentSchema?.elements[0].type).toBe('text');
    });

    it('should add element at end if no position specified', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.addElement('email');

      expect(store.currentSchema?.elements).toHaveLength(2);
      expect(store.currentSchema?.elements[1].type).toBe('email');
      expect(store.currentSchema?.elements[1].order).toBe(1);
    });

    it('should add element at specific position', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.addElement('email');
      store.addElement('password', 1);

      expect(store.currentSchema?.elements).toHaveLength(3);
      const passwordElement = store.currentSchema?.elements.find(el => el.type === 'password');
      expect(passwordElement?.order).toBe(1);
    });

    it('should adjust orders when inserting in middle', () => {
      const store = useFormBuilderStore();
      store.addElement('text'); // order 0
      store.addElement('email'); // order 1
      store.addElement('password', 1); // insert at position 1

      const elements = store.currentSchema?.elements || [];
      const textElement = elements.find(el => el.type === 'text');
      const passwordElement = elements.find(el => el.type === 'password');
      const emailElement = elements.find(el => el.type === 'email');

      expect(textElement?.order).toBe(0);
      expect(passwordElement?.order).toBe(1);
      expect(emailElement?.order).toBe(2);
    });

    it('should update schema updated date', () => {
      const store = useFormBuilderStore();
      const initialUpdated = store.currentSchema?.updated;

      vi.advanceTimersByTime(1000);
      store.addElement('text');

      expect(store.currentSchema?.updated).not.toEqual(initialUpdated);
    });

    it('should select newly added element', () => {
      const store = useFormBuilderStore();
      store.addElement('text');

      expect(store.selectedElement).not.toBeNull();
      expect(store.selectedElement?.type).toBe('text');
    });

    it('should not add element if no schema exists', () => {
      const store = useFormBuilderStore();
      store.currentSchema = null;
      store.addElement('text');

      expect(store.currentSchema).toBeNull();
    });
  });

  describe('updateElement', () => {
    let elementId: string;

    beforeEach(() => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
      store.addElement('text');
      elementId = store.currentSchema?.elements[0].id || '';
    });

    it('should update element properties', () => {
      const store = useFormBuilderStore();
      store.updateElement(elementId, { label: 'Updated Label', required: true });

      const element = store.currentSchema?.elements[0];
      expect(element?.label).toBe('Updated Label');
      expect(element?.required).toBe(true);
    });

    it('should update schema updated date', () => {
      const store = useFormBuilderStore();
      const initialUpdated = store.currentSchema?.updated;

      vi.advanceTimersByTime(1000);
      store.updateElement(elementId, { label: 'Updated' });

      expect(store.currentSchema?.updated).not.toEqual(initialUpdated);
    });

    it('should not update if element not found', () => {
      const store = useFormBuilderStore();
      const initialLabel = store.currentSchema?.elements[0].label;

      store.updateElement('non-existent-id', { label: 'Updated' });

      expect(store.currentSchema?.elements[0].label).toBe(initialLabel);
    });

    it('should not update if no schema exists', () => {
      const store = useFormBuilderStore();
      store.currentSchema = null;
      store.updateElement(elementId, { label: 'Updated' });

      expect(store.currentSchema).toBeNull();
    });
  });

  describe('removeElement', () => {
    let elementId1: string;
    let elementId2: string;
    let elementId3: string;

    beforeEach(() => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
      store.addElement('text');
      elementId1 = store.currentSchema?.elements[0].id || '';
      store.addElement('email');
      elementId2 = store.currentSchema?.elements[1].id || '';
      store.addElement('password');
      elementId3 = store.currentSchema?.elements[2].id || '';
    });

    it('should remove element from form', () => {
      const store = useFormBuilderStore();
      store.removeElement(elementId2);

      expect(store.currentSchema?.elements).toHaveLength(2);
      const ids = store.currentSchema?.elements.map(el => el.id);
      expect(ids).not.toContain(elementId2);
    });

    it('should adjust orders after removal', () => {
      const store = useFormBuilderStore();
      store.removeElement(elementId2); // Remove middle element

      const elements = store.currentSchema?.elements || [];
      const element1 = elements.find(el => el.id === elementId1);
      const element3 = elements.find(el => el.id === elementId3);

      expect(element1?.order).toBe(0);
      expect(element3?.order).toBe(1);
    });

    it('should update schema updated date', () => {
      const store = useFormBuilderStore();
      const initialUpdated = store.currentSchema?.updated;

      vi.advanceTimersByTime(1000);
      store.removeElement(elementId1);

      expect(store.currentSchema?.updated).not.toEqual(initialUpdated);
    });

    it('should clear selected element if it was removed', () => {
      const store = useFormBuilderStore();
      store.selectElement(elementId1);
      expect(store.selectedElement?.id).toBe(elementId1);

      store.removeElement(elementId1);
      expect(store.selectedElement).toBeNull();
    });

    it('should not clear selected element if different element removed', () => {
      const store = useFormBuilderStore();
      store.selectElement(elementId1);
      store.removeElement(elementId2);

      expect(store.selectedElement?.id).toBe(elementId1);
    });

    it('should not remove if element not found', () => {
      const store = useFormBuilderStore();
      const initialLength = store.currentSchema?.elements.length;

      store.removeElement('non-existent-id');

      expect(store.currentSchema?.elements).toHaveLength(initialLength || 0);
    });
  });

  describe('reorderElement', () => {
    let elementId1: string;
    let elementId2: string;
    let elementId3: string;

    beforeEach(() => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
      store.addElement('text');
      elementId1 = store.currentSchema?.elements[0].id || '';
      store.addElement('email');
      elementId2 = store.currentSchema?.elements[1].id || '';
      store.addElement('password');
      elementId3 = store.currentSchema?.elements[2].id || '';
    });

    it('should move element down (increase order)', () => {
      const store = useFormBuilderStore();
      store.reorderElement(elementId1, 2); // Move from 0 to 2

      const elements = store.currentSchema?.elements || [];
      const element1 = elements.find(el => el.id === elementId1);
      const element2 = elements.find(el => el.id === elementId2);
      const element3 = elements.find(el => el.id === elementId3);

      expect(element1?.order).toBe(2);
      expect(element2?.order).toBe(0);
      expect(element3?.order).toBe(1);
    });

    it('should move element up (decrease order)', () => {
      const store = useFormBuilderStore();
      store.reorderElement(elementId3, 0); // Move from 2 to 0

      const elements = store.currentSchema?.elements || [];
      const element1 = elements.find(el => el.id === elementId1);
      const element2 = elements.find(el => el.id === elementId2);
      const element3 = elements.find(el => el.id === elementId3);

      expect(element1?.order).toBe(1);
      expect(element2?.order).toBe(2);
      expect(element3?.order).toBe(0);
    });

    it('should update schema updated date', () => {
      const store = useFormBuilderStore();
      const initialUpdated = store.currentSchema?.updated;

      vi.advanceTimersByTime(1000);
      store.reorderElement(elementId1, 2);

      expect(store.currentSchema?.updated).not.toEqual(initialUpdated);
    });

    it('should not reorder if element not found', () => {
      const store = useFormBuilderStore();
      store.reorderElement('non-existent-id', 1);

      const elements = store.currentSchema?.elements || [];
      const element1 = elements.find(el => el.id === elementId1);
      expect(element1?.order).toBe(0);
    });
  });

  describe('selectElement', () => {
    let elementId: string;

    beforeEach(() => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
      store.addElement('text');
      elementId = store.currentSchema?.elements[0].id || '';
    });

    it('should select element by ID', () => {
      const store = useFormBuilderStore();
      store.selectedElement = null;
      store.selectElement(elementId);

      expect(store.selectedElement).not.toBeNull();
      expect(store.selectedElement?.id).toBe(elementId);
    });

    it('should clear selection when null is passed', () => {
      const store = useFormBuilderStore();
      store.selectElement(elementId);
      store.selectElement(null);

      expect(store.selectedElement).toBeNull();
    });

    it('should not select if element not found', () => {
      const store = useFormBuilderStore();
      store.selectElement('non-existent-id');

      expect(store.selectedElement).toBeNull();
    });
  });

  describe('togglePreviewMode', () => {
    it('should toggle preview mode from false to true', () => {
      const store = useFormBuilderStore();
      expect(store.previewMode).toBe(false);

      store.togglePreviewMode();
      expect(store.previewMode).toBe(true);
    });

    it('should toggle preview mode from true to false', () => {
      const store = useFormBuilderStore();
      store.previewMode = true;

      store.togglePreviewMode();
      expect(store.previewMode).toBe(false);
    });

    it('should clear selected element when entering preview mode', () => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
      store.addElement('text');
      const elementId = store.currentSchema?.elements[0].id || '';
      store.selectElement(elementId);

      store.togglePreviewMode();
      expect(store.selectedElement).toBeNull();
    });
  });

  describe('getters', () => {
    describe('sortedElements', () => {
      it('should return empty array when no schema', () => {
        const store = useFormBuilderStore();
        expect(store.sortedElements).toEqual([]);
      });

      it('should return elements sorted by order', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        store.addElement('text');
        store.addElement('email');
        store.addElement('password');

        const sorted = store.sortedElements;
        expect(sorted[0].order).toBe(0);
        expect(sorted[1].order).toBe(1);
        expect(sorted[2].order).toBe(2);
      });

      it('should sort correctly when orders are not sequential', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        store.addElement('text');
        store.addElement('email');
        store.addElement('password');

        // Manually adjust orders
        if (store.currentSchema) {
          store.currentSchema.elements[0].order = 5;
          store.currentSchema.elements[1].order = 1;
          store.currentSchema.elements[2].order = 3;
        }

        const sorted = store.sortedElements;
        expect(sorted[0].order).toBe(1);
        expect(sorted[1].order).toBe(3);
        expect(sorted[2].order).toBe(5);
      });
    });

    describe('hasElements', () => {
      it('should return false when no schema', () => {
        const store = useFormBuilderStore();
        expect(store.hasElements).toBe(false);
      });

      it('should return false when schema has no elements', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        expect(store.hasElements).toBe(false);
      });

      it('should return true when schema has elements', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        store.addElement('text');
        expect(store.hasElements).toBe(true);
      });
    });

    describe('jsonSchema', () => {
      it('should return null when no schema', () => {
        const store = useFormBuilderStore();
        expect(store.jsonSchema).toBeNull();
      });

      it('should generate basic JSON schema', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form', 'Test Description');

        const schema = store.jsonSchema as any;
        expect(schema.type).toBe('object');
        expect(schema.title).toBe('Test Form');
        expect(schema.description).toBe('Test Description');
        expect(schema.properties).toEqual({});
        expect(schema.required).toEqual([]);
      });

      it('should include text field in JSON schema', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        store.addElement('text');
        store.updateElement(store.currentSchema!.elements[0].id, {
          name: 'username',
          label: 'Username',
          required: true,
        });

        const schema = store.jsonSchema as any;
        expect(schema.properties.username).toEqual({
          type: 'string',
          title: 'Username',
        });
        expect(schema.required).toContain('username');
      });

      it('should include number field constraints', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        store.addElement('number');
        const element = store.currentSchema!.elements[0];
        store.updateElement(element.id, {
          name: 'age',
          label: 'Age',
        });

        const schema = store.jsonSchema as any;
        expect(schema.properties.age.type).toBe('number');
        expect(schema.properties.age.minimum).toBe(0);
        expect(schema.properties.age.maximum).toBe(100);
      });

      it('should include select field enum values', () => {
        const store = useFormBuilderStore();
        store.createNewForm('Test Form');
        store.addElement('select');
        const element = store.currentSchema!.elements[0];
        store.updateElement(element.id, {
          name: 'choice',
          label: 'Choice',
        });

        const schema = store.jsonSchema as any;
        expect(schema.properties.choice.enum).toEqual(['option1', 'option2']);
      });
    });
  });

  describe('validateForm', () => {
    beforeEach(() => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
    });

    it('should return false when no schema', () => {
      const store = useFormBuilderStore();
      store.currentSchema = null;
      expect(store.validateForm()).toBe(false);
    });

    it('should return true for valid form', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.updateElement(store.currentSchema!.elements[0].id, {
        name: 'field1',
        label: 'Field 1',
      });

      expect(store.validateForm()).toBe(true);
      expect(store.validationErrors).toHaveLength(0);
    });

    it('should detect duplicate field names', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.addElement('email');

      store.updateElement(store.currentSchema!.elements[0].id, {
        name: 'duplicate',
        label: 'Field 1',
      });
      store.updateElement(store.currentSchema!.elements[1].id, {
        name: 'duplicate',
        label: 'Field 2',
      });

      expect(store.validateForm()).toBe(false);
      expect(store.validationErrors.length).toBeGreaterThan(0);
      expect(store.validationErrors[0].rule).toBe('unique');
    });

    it('should detect missing field name', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.updateElement(store.currentSchema!.elements[0].id, {
        name: '',
        label: 'Field 1',
      });

      expect(store.validateForm()).toBe(false);
      const hasNameError = store.validationErrors.some(
        err => err.rule === 'required' && err.message.includes('name')
      );
      expect(hasNameError).toBe(true);
    });

    it('should detect missing field label', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.updateElement(store.currentSchema!.elements[0].id, {
        name: 'field1',
        label: '',
      });

      expect(store.validateForm()).toBe(false);
      const hasLabelError = store.validationErrors.some(
        err => err.rule === 'required' && err.message.includes('label')
      );
      expect(hasLabelError).toBe(true);
    });

    it('should clear previous validation errors', () => {
      const store = useFormBuilderStore();
      store.addElement('text');
      store.updateElement(store.currentSchema!.elements[0].id, {
        name: '',
        label: '',
      });

      store.validateForm();
      expect(store.validationErrors.length).toBeGreaterThan(0);

      store.updateElement(store.currentSchema!.elements[0].id, {
        name: 'field1',
        label: 'Field 1',
      });

      store.validateForm();
      expect(store.validationErrors).toHaveLength(0);
    });
  });

  describe('exportToJsonSchema', () => {
    it('should export as formatted JSON string', () => {
      const store = useFormBuilderStore();
      store.createNewForm('Test Form');
      store.addElement('text');
      store.updateElement(store.currentSchema!.elements[0].id, {
        name: 'field1',
        label: 'Field 1',
      });

      const exported = store.exportToJsonSchema();
      expect(typeof exported).toBe('string');
      expect(exported).toContain('Test Form');
      expect(exported).toContain('field1');

      const parsed = JSON.parse(exported);
      expect(parsed.type).toBe('object');
    });
  });

  describe('importFromJsonSchema', () => {
    it('should import basic JSON schema', () => {
      const store = useFormBuilderStore();
      const jsonSchema = {
        type: 'object',
        title: 'Imported Form',
        description: 'Imported Description',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
        },
        required: ['name'],
      };

      const result = store.importFromJsonSchema(JSON.stringify(jsonSchema));

      expect(result).toBe(true);
      expect(store.currentSchema?.title).toBe('Imported Form');
      expect(store.currentSchema?.description).toBe('Imported Description');
      expect(store.currentSchema?.elements).toHaveLength(1);
      expect(store.currentSchema?.elements[0].name).toBe('name');
      expect(store.currentSchema?.elements[0].required).toBe(true);
    });

    it('should import number field', () => {
      const store = useFormBuilderStore();
      const jsonSchema = {
        type: 'object',
        title: 'Test',
        properties: {
          age: {
            type: 'number',
            title: 'Age',
            minimum: 18,
            maximum: 65,
          },
        },
      };

      store.importFromJsonSchema(JSON.stringify(jsonSchema));

      const element = store.currentSchema?.elements[0] as any;
      expect(element.type).toBe('number');
      expect(element.min).toBe(18);
      expect(element.max).toBe(65);
    });

    it('should import select field with enum', () => {
      const store = useFormBuilderStore();
      const jsonSchema = {
        type: 'object',
        title: 'Test',
        properties: {
          choice: {
            type: 'string',
            title: 'Choice',
            enum: ['opt1', 'opt2', 'opt3'],
          },
        },
      };

      store.importFromJsonSchema(JSON.stringify(jsonSchema));

      const element = store.currentSchema?.elements[0] as any;
      expect(element.type).toBe('select');
      expect(element.options).toHaveLength(3);
      expect(element.options[0].value).toBe('opt1');
    });

    it('should handle invalid JSON', () => {
      const store = useFormBuilderStore();
      const result = store.importFromJsonSchema('invalid json');

      expect(result).toBe(false);
    });

    it('should use default title if not provided', () => {
      const store = useFormBuilderStore();
      const jsonSchema = {
        type: 'object',
        properties: {},
      };

      store.importFromJsonSchema(JSON.stringify(jsonSchema));

      expect(store.currentSchema?.title).toBe('Imported Form');
    });
  });
});
