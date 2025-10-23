<!-- components/ElementProperties.vue -->

<style scoped>
.element-properties {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.properties-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.properties-header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.properties-header p {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.property-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.property-section:last-child {
  border-bottom: none;
}

.property-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-field {
  margin-bottom: 16px;
}

.property-field label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #495057;
}

.property-field input[type="text"],
.property-field input[type="number"],
.property-field input[type="date"],
.property-field input[type="datetime-local"],
.property-field input[type="time"],
.property-field textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.property-field input:focus,
.property-field textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.property-field input[type="checkbox"] {
  margin-right: 8px;
}

.property-field small {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #6c757d;
}

.property-field small.error {
  color: #dc3545;
}

.property-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.options-list {
  margin-top: 8px;
}

.option-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.option-item input {
  flex: 1;
}

.remove-option {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-option:hover {
  background-color: #c82333;
}

.add-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #495057;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.add-option:hover {
  background-color: #e9ecef;
  border-color: #007bff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #495057;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.action-btn.danger {
  border-color: #dc3545;
  color: #dc3545;
}

.action-btn.danger:hover {
  background-color: #dc3545;
  color: white;
}
</style>

<template>
  <div class="element-properties">
    <div class="properties-header">
      <h3>Properties</h3>
      <p v-if="!selectedElement">Select an element to edit its properties</p>
    </div>

    <div v-if="selectedElement" class="properties-content">
      <!-- Basic Properties -->
      <div class="property-section">
        <h4>Basic Properties</h4>

        <div class="property-field">
          <label>Label *</label>
          <input
              v-model="selectedElement.label"
              type="text"
              placeholder="Field label"
              @input="updateElement"
          >
        </div>

        <div class="property-field">
          <label>Field Name *</label>
          <input
              v-model="selectedElement.name"
              type="text"
              placeholder="field_name"
              @input="updateElement"
              @blur="sanitizeName"
          >
          <small v-if="!isValidName" class="error">
            Field name must start with a letter and contain only letters, numbers, and underscores
          </small>
        </div>

        <div class="property-field">
          <label>Description</label>
          <textarea
              v-model="selectedElement.description"
              placeholder="Field description (optional)"
              rows="2"
              @input="updateElement"
          ></textarea>
        </div>

        <div class="property-field">
          <label>
            <input
                v-model="selectedElement.required"
                type="checkbox"
                @change="updateElement"
            >
            Required field
          </label>
        </div>
      </div>

      <!-- Type-specific Properties -->

      <!-- Text Input Properties -->
      <div v-if="isTextInput" class="property-section">
        <h4>Text Properties</h4>

        <div class="property-field">
          <label>Placeholder</label>
          <input
              v-model="textElement.placeholder"
              type="text"
              placeholder="Placeholder text"
              @input="updateElement"
          >
        </div>

        <div class="property-field">
          <label>Default Value</label>
          <input
              v-model="textElement.defaultValue"
              type="text"
              placeholder="Default value"
              @input="updateElement"
          >
        </div>

        <div class="property-row">
          <div class="property-field">
            <label>Min Length</label>
            <input
                v-model.number="textElement.minLength"
                type="number"
                min="0"
                @input="updateElement"
            >
          </div>
          <div class="property-field">
            <label>Max Length</label>
            <input
                v-model.number="textElement.maxLength"
                type="number"
                min="0"
                @input="updateElement"
            >
          </div>
        </div>

        <div class="property-field">
          <label>Pattern (Regex)</label>
          <input
              v-model="textElement.pattern"
              type="text"
              placeholder="^[a-zA-Z0-9]+$"
              @input="updateElement"
          >
          <small>Regular expression pattern for validation</small>
        </div>
      </div>

      <!-- Number Input Properties -->
      <div v-if="isNumberInput" class="property-section">
        <h4>Number Properties</h4>

        <div class="property-field">
          <label>Default Value</label>
          <input
              v-model.number="numberElement.defaultValue"
              type="number"
              @input="updateElement"
          >
        </div>

        <div class="property-row">
          <div class="property-field">
            <label>Minimum</label>
            <input
                v-model.number="numberElement.min"
                type="number"
                @input="updateElement"
            >
          </div>
          <div class="property-field">
            <label>Maximum</label>
            <input
                v-model.number="numberElement.max"
                type="number"
                @input="updateElement"
            >
          </div>
        </div>

        <div class="property-field">
          <label>Step</label>
          <input
              v-model.number="numberElement.step"
              type="number"
              min="0.01"
              step="0.01"
              @input="updateElement"
          >
        </div>
      </div>

      <!-- Date Input Properties -->
      <div v-if="isDateInput" class="property-section">
        <h4>Date Properties</h4>

        <div class="property-field">
          <label>Default Value</label>
          <input
              v-model="dateElement.defaultValue"
              :type="selectedElement.type"
              @input="updateElement"
          >
        </div>

        <div class="property-row">
          <div class="property-field">
            <label>Minimum Date</label>
            <input
                v-model="dateElement.min"
                :type="selectedElement.type"
                @input="updateElement"
            >
          </div>
          <div class="property-field">
            <label>Maximum Date</label>
            <input
                v-model="dateElement.max"
                :type="selectedElement.type"
                @input="updateElement"
            >
          </div>
        </div>
      </div>

      <!-- Selection Properties -->
      <div v-if="isSelectionInput" class="property-section">
        <h4>Options</h4>

        <div v-if="selectedElement.type === 'select'" class="property-field">
          <label>
            <input
                v-model="selectElement.multiple"
                type="checkbox"
                @change="updateElement"
            >
            Allow multiple selection
          </label>
        </div>

        <div class="property-field">
          <label>Default Value</label>
          <input
              v-model="selectElement.defaultValue"
              type="text"
              placeholder="Default option value"
              @input="updateElement"
          >
        </div>

        <div class="options-list">
          <div
              v-for="(option, index) in selectElement.options"
              :key="index"
              class="option-item"
          >
            <input
                v-model="option.value"
                type="text"
                placeholder="Value"
                @input="updateElement"
            >
            <input
                v-model="option.label"
                type="text"
                placeholder="Label"
                @input="updateElement"
            >
            <button @click="removeOption(index)" class="remove-option">
              <i class="mdi mdi-close"></i>
            </button>
          </div>

          <button @click="addOption" class="add-option">
            <i class="mdi mdi-plus"></i>
            Add Option
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="property-section">
        <h4>Actions</h4>
        <div class="action-buttons">
          <button @click="duplicateElement" class="action-btn">
            <i class="mdi mdi-content-copy"></i>
            Duplicate
          </button>
          <button @click="deleteElement" class="action-btn danger">
            <i class="mdi mdi-delete"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';
import { isValidFieldName, sanitizeFieldName } from '@/utils/formUtils.ts';
import type { TextFieldElement, NumberFieldElement, DateFieldElement, SelectFieldElement } from '@/types/formBuilder.ts';

/**
 * Element Properties Component
 *
 * Provides a property editor for the currently selected form element.
 * Dynamically shows relevant properties based on element type.
 */

const formBuilderStore = useFormBuilderStore();

// Computed properties
const selectedElement = computed(() => formBuilderStore.selectedElement);

const isTextInput = computed(() =>
    selectedElement.value && ['text', 'email', 'password', 'textarea'].includes(selectedElement.value.type)
);

const isNumberInput = computed(() =>
    selectedElement.value && ['number', 'range'].includes(selectedElement.value.type)
);

const isDateInput = computed(() =>
    selectedElement.value && ['date', 'datetime', 'time'].includes(selectedElement.value.type)
);

const isSelectionInput = computed(() =>
    selectedElement.value && ['select', 'radio', 'checkbox'].includes(selectedElement.value.type)
);

const textElement = computed(() => selectedElement.value as TextFieldElement);
const numberElement = computed(() => selectedElement.value as NumberFieldElement);
const dateElement = computed(() => selectedElement.value as DateFieldElement);
const selectElement = computed(() => selectedElement.value as SelectFieldElement);

const isValidName = computed(() => {
  if (!selectedElement.value) return true;
  return isValidFieldName(selectedElement.value.name);
});

/**
 * Update the selected element in the store
 */
function updateElement() {
  if (!selectedElement.value) return;
  formBuilderStore.updateElement(selectedElement.value.id, { ...selectedElement.value });
}

/**
 * Sanitize the field name
 */
function sanitizeName() {
  if (!selectedElement.value) return;
  const sanitized = sanitizeFieldName(selectedElement.value.name);
  if (sanitized !== selectedElement.value.name) {
    selectedElement.value.name = sanitized;
    updateElement();
  }
}

/**
 * Add a new option to selection elements
 */
function addOption() {
  if (!isSelectionInput.value || !selectedElement.value) return;

  const selectEl = selectedElement.value as SelectFieldElement;
  selectEl.options.push({
    value: `option_${selectEl.options.length + 1}`,
    label: `Option ${selectEl.options.length + 1}`
  });
  updateElement();
}

/**
 * Remove an option from selection elements
 */
function removeOption(index: number) {
  if (!isSelectionInput.value || !selectedElement.value) return;

  const selectEl = selectedElement.value as SelectFieldElement;
  if (selectEl.options.length > 1) {
    selectEl.options.splice(index, 1);
    updateElement();
  }
}

/**
 * Duplicate the current element
 */
function duplicateElement() {
  if (!selectedElement.value) return;

  const element = selectedElement.value;
  formBuilderStore.addElement(element.type);

  // Get the newly added element and copy properties
  setTimeout(() => {
    const newElement = formBuilderStore.sortedElements[formBuilderStore.sortedElements.length - 1];
    if (newElement) {
      const updates = {
        ...element,
        id: newElement.id,
        name: `${element.name}_copy`,
        label: `${element.label} (Copy)`,
        order: newElement.order
      };
      formBuilderStore.updateElement(newElement.id, updates);
    }
  }, 0);
}

/**
 * Delete the current element
 */
function deleteElement() {
  if (!selectedElement.value) return;

  if (confirm('Are you sure you want to delete this element?')) {
    formBuilderStore.removeElement(selectedElement.value.id);
  }
}
</script>
