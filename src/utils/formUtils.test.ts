import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateId,
  createDefaultElement,
  isValidFieldName,
  sanitizeFieldName,
  DRAG_ITEMS,
} from './formUtils';
import type { FormElementType } from '@/types/formBuilder';

describe('formUtils', () => {
  describe('generateId', () => {
    it('should generate a unique ID with correct prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^form-\d+-[a-z0-9]+$/);
    });

    it('should generate different IDs on subsequent calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs of reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(50);
    });
  });

  describe('createDefaultElement', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('text field types', () => {
      it('should create a text field element with correct properties', () => {
        const element = createDefaultElement('text');
        expect(element.type).toBe('text');
        expect(element.label).toBe('Text Field');
        expect(element.name).toMatch(/^field_\d+$/);
        expect(element.required).toBe(false);
        expect(element.order).toBe(0);
        expect((element as any).placeholder).toBe('Enter text field');
      });

      it('should create an email field element', () => {
        const element = createDefaultElement('email');
        expect(element.type).toBe('email');
        expect(element.label).toBe('Email Field');
        expect((element as any).placeholder).toBe('Enter email field');
      });

      it('should create a password field element', () => {
        const element = createDefaultElement('password');
        expect(element.type).toBe('password');
        expect(element.label).toBe('Password Field');
        expect((element as any).placeholder).toBe('Enter password field');
      });

      it('should create a textarea element', () => {
        const element = createDefaultElement('textarea');
        expect(element.type).toBe('textarea');
        expect(element.label).toBe('Text Area');
        expect((element as any).placeholder).toBe('Enter text area');
      });
    });

    describe('number field types', () => {
      it('should create a number field with min, max, and step', () => {
        const element = createDefaultElement('number');
        expect(element.type).toBe('number');
        expect(element.label).toBe('Number Field');
        expect((element as any).min).toBe(0);
        expect((element as any).max).toBe(100);
        expect((element as any).step).toBe(1);
      });

      it('should create a range field with min, max, and step', () => {
        const element = createDefaultElement('range');
        expect(element.type).toBe('range');
        expect(element.label).toBe('Range Slider');
        expect((element as any).min).toBe(0);
        expect((element as any).max).toBe(100);
        expect((element as any).step).toBe(1);
      });
    });

    describe('date/time field types', () => {
      it('should create a date field element', () => {
        const element = createDefaultElement('date');
        expect(element.type).toBe('date');
        expect(element.label).toBe('Date Picker');
      });

      it('should create a datetime field element', () => {
        const element = createDefaultElement('datetime');
        expect(element.type).toBe('datetime');
        expect(element.label).toBe('Date Time Picker');
      });

      it('should create a time field element', () => {
        const element = createDefaultElement('time');
        expect(element.type).toBe('time');
        expect(element.label).toBe('Time Picker');
      });
    });

    describe('select field types', () => {
      it('should create a select field with options', () => {
        const element = createDefaultElement('select');
        expect(element.type).toBe('select');
        expect(element.label).toBe('Select Dropdown');
        expect((element as any).options).toEqual([
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]);
        expect((element as any).multiple).toBe(false);
      });

      it('should create a radio field with options', () => {
        const element = createDefaultElement('radio');
        expect(element.type).toBe('radio');
        expect(element.label).toBe('Radio Button Group');
        expect((element as any).options).toEqual([
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]);
        expect((element as any).multiple).toBe(false);
      });

      it('should create a checkbox field with options', () => {
        const element = createDefaultElement('checkbox');
        expect(element.type).toBe('checkbox');
        expect(element.label).toBe('Checkbox Group');
        expect((element as any).options).toEqual([
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]);
        expect((element as any).multiple).toBe(true);
      });
    });

    it('should generate unique IDs for each element', () => {
      const element1 = createDefaultElement('text');
      const element2 = createDefaultElement('email');
      expect(element1.id).not.toBe(element2.id);
    });
  });

  describe('isValidFieldName', () => {
    it('should return true for valid field names starting with a letter', () => {
      expect(isValidFieldName('fieldName')).toBe(true);
      expect(isValidFieldName('field_name')).toBe(true);
      expect(isValidFieldName('field123')).toBe(true);
      expect(isValidFieldName('a')).toBe(true);
      expect(isValidFieldName('Field_Name_123')).toBe(true);
    });

    it('should return false for field names starting with a number', () => {
      expect(isValidFieldName('123field')).toBe(false);
      expect(isValidFieldName('1')).toBe(false);
    });

    it('should return false for field names with special characters', () => {
      expect(isValidFieldName('field-name')).toBe(false);
      expect(isValidFieldName('field name')).toBe(false);
      expect(isValidFieldName('field@name')).toBe(false);
      expect(isValidFieldName('field.name')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isValidFieldName('')).toBe(false);
    });

    it('should return false for field names starting with underscore', () => {
      expect(isValidFieldName('_fieldName')).toBe(false);
    });
  });

  describe('sanitizeFieldName', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeFieldName('FieldName')).toBe('fieldname');
      expect(sanitizeFieldName('FIELDNAME')).toBe('fieldname');
    });

    it('should replace special characters with underscores', () => {
      expect(sanitizeFieldName('field-name')).toBe('field_name');
      expect(sanitizeFieldName('field name')).toBe('field_name');
      expect(sanitizeFieldName('field@name')).toBe('field_name');
      expect(sanitizeFieldName('field.name')).toBe('field_name');
    });

    it('should prefix numbers with field_', () => {
      expect(sanitizeFieldName('123field')).toBe('field_123field');
      expect(sanitizeFieldName('1')).toBe('field_1');
    });

    it('should collapse multiple underscores', () => {
      expect(sanitizeFieldName('field___name')).toBe('field_name');
      expect(sanitizeFieldName('field  name')).toBe('field_name');
    });

    it('should remove leading and trailing underscores', () => {
      expect(sanitizeFieldName('_fieldName')).toBe('fieldname');
      expect(sanitizeFieldName('fieldName_')).toBe('fieldname');
      expect(sanitizeFieldName('_fieldName_')).toBe('fieldname');
    });

    it('should handle complex cases', () => {
      expect(sanitizeFieldName('My Field Name 123!')).toBe('my_field_name_123');
      expect(sanitizeFieldName('___test___')).toBe('test');
      expect(sanitizeFieldName('field--name__test')).toBe('field_name_test');
    });

    it('should handle empty strings', () => {
      expect(sanitizeFieldName('')).toBe('');
    });
  });

  describe('DRAG_ITEMS', () => {
    it('should contain all form element types', () => {
      const types: FormElementType[] = [
        'text',
        'email',
        'password',
        'textarea',
        'number',
        'range',
        'date',
        'datetime',
        'time',
        'select',
        'radio',
        'checkbox',
      ];

      const dragItemTypes = DRAG_ITEMS.map((item) => item.type);
      types.forEach((type) => {
        expect(dragItemTypes).toContain(type);
      });
    });

    it('should have correct structure for each drag item', () => {
      DRAG_ITEMS.forEach((item) => {
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('icon');
        expect(typeof item.type).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.icon).toBe('string');
        expect(item.icon).toMatch(/^mdi-/);
      });
    });

    it('should have exactly 12 items', () => {
      expect(DRAG_ITEMS).toHaveLength(12);
    });

    it('should have unique types', () => {
      const types = DRAG_ITEMS.map((item) => item.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(DRAG_ITEMS.length);
    });
  });
});
