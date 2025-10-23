<!-- components/FormElementRenderer.vue -->
<style scoped>
.form-element-renderer {
  width: 100%;
}

.form-field {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.required {
  color: #dc3545;
  margin-left: 2px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px 16px;
  padding-right: 40px;
}

.range-container {
  width: 100%;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
}

.radio-fieldset,
.checkbox-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.radio-fieldset legend,
.checkbox-fieldset legend {
  padding: 0;
  margin-bottom: 12px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-radio,
.form-checkbox {
  margin: 0;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.radio-label,
.checkbox-label {
  margin: 0;
  cursor: pointer;
  font-weight: normal;
  font-size: 14px;
  color: #495057;
}

.form-radio:disabled,
.form-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.radio-label:has(.form-radio:disabled),
.checkbox-label:has(.form-checkbox:disabled) {
  cursor: not-allowed;
  opacity: 0.6;
}

.field-description {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

/* Responsive design */
@media (max-width: 768px) {
  .radio-group,
  .checkbox-group {
    gap: 12px;
  }

  .form-input,
  .form-textarea,
  .form-select {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>

<template>
  <div class="form-element-renderer">
    <!-- Text Input -->
    <div v-if="isTextInput" class="form-field">
      <label :for="elementId" class="field-label">
        {{ element.label }}
        <span v-if="element.required" class="required">*</span>
      </label>
      <input
          v-if="element.type !== 'textarea'"
          :id="elementId"
          :type="element.type"
          :placeholder="textElement.placeholder"
          :value="preview ? textElement.defaultValue : ''"
          :required="element.required"
          :minlength="textElement.minLength"
          :maxlength="textElement.maxLength"
          :pattern="textElement.pattern"
          :disabled="!preview"
          class="form-input"
      />
      <textarea
          v-else
          :id="elementId"
          :placeholder="textElement.placeholder"
          :value="preview ? textElement.defaultValue : ''"
          :required="element.required"
          :minlength="textElement.minLength"
          :maxlength="textElement.maxLength"
          :disabled="!preview"
          class="form-textarea"
          rows="3"
      ></textarea>
      <small v-if="element.description" class="field-description">
        {{ element.description }}
      </small>
    </div>

    <!-- Number Input -->
    <div v-else-if="isNumberInput" class="form-field">
      <label :for="elementId" class="field-label">
        {{ element.label }}
        <span v-if="element.required" class="required">*</span>
      </label>
      <input
          v-if="element.type === 'number'"
          :id="elementId"
          type="number"
          :value="preview ? numberElement.defaultValue : ''"
          :min="numberElement.min"
          :max="numberElement.max"
          :step="numberElement.step"
          :required="element.required"
          :disabled="!preview"
          class="form-input"
      />
      <div v-else class="range-container">
        <input
            :id="elementId"
            type="range"
            :value="preview ? numberElement.defaultValue : numberElement.min || 0"
            :min="numberElement.min"
            :max="numberElement.max"
            :step="numberElement.step"
            :required="element.required"
            :disabled="!preview"
            class="form-range"
        />
        <div class="range-labels">
          <span>{{ numberElement.min || 0 }}</span>
          <span>{{ numberElement.max || 100 }}</span>
        </div>
      </div>
      <small v-if="element.description" class="field-description">
        {{ element.description }}
      </small>
    </div>

    <!-- Date Input -->
    <div v-else-if="isDateInput" class="form-field">
      <label :for="elementId" class="field-label">
        {{ element.label }}
        <span v-if="element.required" class="required">*</span>
      </label>
      <input
          :id="elementId"
          :type="getDateInputType(element.type)"
          :value="preview ? dateElement.defaultValue : ''"
          :min="dateElement.min"
          :max="dateElement.max"
          :required="element.required"
          :disabled="!preview"
          class="form-input"
      />
      <small v-if="element.description" class="field-description">
        {{ element.description }}
      </small>
    </div>

    <!-- Select Dropdown -->
    <div v-else-if="element.type === 'select'" class="form-field">
      <label :for="elementId" class="field-label">
        {{ element.label }}
        <span v-if="element.required" class="required">*</span>
      </label>
      <select
          :id="elementId"
          :multiple="selectElement.multiple"
          :required="element.required"
          :disabled="!preview"
          class="form-select"
      >
        <option value="" disabled>Choose an option</option>
        <option
            v-for="option in selectElement.options"
            :key="option.value"
            :value="option.value"
            :selected="preview && isSelected(option.value)"
        >
          {{ option.label }}
        </option>
      </select>
      <small v-if="element.description" class="field-description">
        {{ element.description }}
      </small>
    </div>

    <!-- Radio Button Group -->
    <div v-else-if="element.type === 'radio'" class="form-field">
      <fieldset class="radio-fieldset">
        <legend class="field-label">
          {{ element.label }}
          <span v-if="element.required" class="required">*</span>
        </legend>
        <div class="radio-group">
          <div
              v-for="option in selectElement.options"
              :key="option.value"
              class="radio-option"
          >
            <input
                :id="`${elementId}_${option.value}`"
                :name="elementId"
                type="radio"
                :value="option.value"
                :checked="preview && selectElement.defaultValue === option.value"
                :required="element.required"
                :disabled="!preview"
                class="form-radio"
            />
            <label :for="`${elementId}_${option.value}`" class="radio-label">
              {{ option.label }}
            </label>
          </div>
        </div>
      </fieldset>
      <small v-if="element.description" class="field-description">
        {{ element.description }}
      </small>
    </div>

    <!-- Checkbox Group -->
    <div v-else-if="element.type === 'checkbox'" class="form-field">
      <fieldset class="checkbox-fieldset">
        <legend class="field-label">
          {{ element.label }}
          <span v-if="element.required" class="required">*</span>
        </legend>
        <div class="checkbox-group">
          <div
              v-for="option in selectElement.options"
              :key="option.value"
              class="checkbox-option"
          >
            <input
                :id="`${elementId}_${option.value}`"
                :name="`${elementId}[]`"
                type="checkbox"
                :value="option.value"
                :checked="preview && isSelected(option.value)"
                :required="element.required && !hasAnyChecked"
                :disabled="!preview"
                class="form-checkbox"
            />
            <label :for="`${elementId}_${option.value}`" class="checkbox-label">
              {{ option.label }}
            </label>
          </div>
        </div>
      </fieldset>
      <small v-if="element.description" class="field-description">
        {{ element.description }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  FormElement,
  TextFieldElement,
  NumberFieldElement,
  DateFieldElement,
  SelectFieldElement
} from '@/types/form-builder';

/**
 * Form Element Renderer Component
 *
 * Renders the actual form input based on the element type and properties.
 * Can be used in both builder mode (disabled) and preview mode (interactive).
 */

interface Props {
  element: FormElement;
  preview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  preview: false
});

// Computed properties
const elementId = computed(() => `field_${props.element.id}`);

const isTextInput = computed(() =>
    ['text', 'email', 'password', 'textarea'].includes(props.element.type)
);

const isNumberInput = computed(() =>
    ['number', 'range'].includes(props.element.type)
);

const isDateInput = computed(() =>
    ['date', 'datetime', 'time'].includes(props.element.type)
);

const textElement = computed(() => props.element as TextFieldElement);
const numberElement = computed(() => props.element as NumberFieldElement);
const dateElement = computed(() => props.element as DateFieldElement);
const selectElement = computed(() => props.element as SelectFieldElement);

const hasAnyChecked = computed(() => {
  if (props.element.type !== 'checkbox' || !props.preview) return false;
  const defaultValues = Array.isArray(selectElement.value.defaultValue)
      ? selectElement.value.defaultValue
      : [];
  return defaultValues.length > 0;
});

/**
 * Get the correct HTML input type for date elements
 */
function getDateInputType(type: string): string {
  switch (type) {
    case 'datetime':
      return 'datetime-local';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    default:
      return 'date';
  }
}

/**
 * Check if an option is selected
 */
function isSelected(value: string): boolean {
  if (!props.preview) return false;

  const defaultValue = selectElement.value.defaultValue;

  if (Array.isArray(defaultValue)) {
    return defaultValue.includes(value);
  }

  return defaultValue === value;
}
</script>

