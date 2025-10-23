<!-- components/FormBuilderToolbar.vue -->

<style scoped>
.form-builder-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  height: 64px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.toolbar-title {
  margin: 0 20px 0 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.form-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-name {
  font-weight: 500;
  color: #495057;
}

.element-count {
  background-color: #e9ecef;
  color: #6c757d;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.toolbar-center {
  flex: 0 0 auto;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #495057;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.toolbar-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.toolbar-btn.primary {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.toolbar-btn.primary:hover {
  background-color: #0056b3;
}

.toolbar-btn.danger {
  border-color: #dc3545;
  color: #dc3545;
}

.toolbar-btn.danger:hover {
  background-color: #dc3545;
  color: white;
}

.toolbar-btn.error {
  border-color: #dc3545;
  background-color: #f8d7da;
  color: #721c24;
}

.toolbar-btn i {
  font-size: 16px;
}

/* Validation Modal */
.validation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.validation-modal {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #dc3545;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.modal-close:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
  color: #dc3545;
}

.error-item:last-child {
  border-bottom: none;
}

.error-item i {
  font-size: 16px;
}
</style>
<template>
  <div class="form-builder-toolbar">
    <div class="toolbar-left">
      <h1 class="toolbar-title">Form Builder</h1>
      <div class="form-info" v-if="currentSchema">
        <span class="form-name">{{ currentSchema.title }}</span>
        <span class="element-count">{{ elementCount }} elements</span>
      </div>
    </div>

    <div class="toolbar-center">
      <div class="toolbar-actions">
        <button
            class="toolbar-btn"
            @click="togglePreview"
            :class="{ active: previewMode }"
        >
          <i class="mdi mdi-eye"></i>
          {{ previewMode ? 'Edit' : 'Preview' }}
        </button>

        <button
            class="toolbar-btn"
            @click="validateForm"
            :class="{ error: hasValidationErrors }"
        >
          <i class="mdi mdi-check-circle"></i>
          Validate
        </button>
      </div>
    </div>

    <div class="toolbar-right">
      <div class="toolbar-actions">
        <!-- Import JSON Schema -->
        <button class="toolbar-btn" @click="triggerImport">
          <i class="mdi mdi-import"></i>
          Import
        </button>
        <input
            ref="importInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleImport"
        >

        <!-- Export JSON Schema -->
        <button class="toolbar-btn" @click="exportSchema">
          <i class="mdi mdi-export"></i>
          Export
        </button>

        <!-- Clear Form -->
        <button class="toolbar-btn danger" @click="clearForm">
          <i class="mdi mdi-delete"></i>
          Clear
        </button>

        <!-- Save Form (placeholder for future implementation) -->
        <button class="toolbar-btn primary" @click="saveForm">
          <i class="mdi mdi-content-save"></i>
          Save
        </button>
      </div>
    </div>

    <!-- Validation Errors Modal -->
    <div v-if="showValidationModal" class="validation-modal-overlay" @click="closeValidationModal">
      <div class="validation-modal" @click.stop>
        <div class="modal-header">
          <h3>Validation Errors</h3>
          <button class="modal-close" @click="closeValidationModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-for="error in validationErrors" :key="error.field" class="error-item">
            <i class="mdi mdi-alert-circle"></i>
            <span>{{ error.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';

/**
 * Form Builder Toolbar Component
 *
 * Provides the main toolbar with actions for:
 * - Preview/Edit mode toggle
 * - Form validation
 * - Import/Export JSON Schema
 * - Clear form
 * - Save form (placeholder)
 */

const formBuilderStore = useFormBuilderStore();

// Refs
const importInput = ref<HTMLInputElement>();
const showValidationModal = ref(false);

// Computed properties
const currentSchema = computed(() => formBuilderStore.currentSchema);
const elementCount = computed(() => formBuilderStore.sortedElements.length);
const previewMode = computed(() => formBuilderStore.previewMode);
const validationErrors = computed(() => formBuilderStore.validationErrors);
const hasValidationErrors = computed(() => validationErrors.value.length > 0);

/**
 * Toggle between preview and edit mode
 */
function togglePreview() {
  formBuilderStore.togglePreviewMode();
}

/**
 * Validate the current form
 */
function validateForm() {
  const isValid = formBuilderStore.validateForm();
  if (!isValid) {
    showValidationModal.value = true;
  } else {
    // Show success notification (you could use a toast library)
    alert('Form validation passed successfully!');
  }
}

/**
 * Close validation modal
 */
function closeValidationModal() {
  showValidationModal.value = false;
}

/**
 * Trigger file input for import
 */
function triggerImport() {
  importInput.value?.click();
}

/**
 * Handle JSON Schema import
 */
function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    try {
      const success = formBuilderStore.importFromJsonSchema(content);
      if (success) {
        alert('Form imported successfully!');
      } else {
        alert('Failed to import form. Please check the JSON Schema format.');
      }
    } catch (error) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

/**
 * Export current form as JSON Schema
 */
function exportSchema() {
  if (!currentSchema.value) {
    alert('No form to export.');
    return;
  }

  const jsonSchema = formBuilderStore.exportToJsonSchema();
  const blob = new Blob([jsonSchema], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentSchema.value.title.replace(/[^a-zA-Z0-9]/g, '_')}_schema.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clear the current form
 */
function clearForm() {
  if (confirm('Are you sure you want to clear the form? This action cannot be undone.')) {
    formBuilderStore.createNewForm('New Form', 'Click here to edit description');
  }
}

/**
 * Save form (placeholder for future implementation)
 */
function saveForm() {
  // This is where you'd implement saving to a backend service
  alert('Save functionality not implemented yet.');
}
</script>
