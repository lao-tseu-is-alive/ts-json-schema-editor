<!-- components/FormPreview.vue -->
<style scoped>
.form-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-preview__header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.form-preview__header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.form-preview__header p {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.preview-form {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-width: 600px;
  margin: 0 auto;
}

.form-title-section {
  margin-bottom: 32px;
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #e9ecef;
}

.form-title-section h2 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.form-description {
  margin: 0;
  font-size: 16px;
  color: #6c757d;
  line-height: 1.5;
}

.empty-preview {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-preview i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-preview p {
  margin: 0;
  font-size: 16px;
}

.form-fields {
  margin-bottom: 32px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.submit-btn,
.reset-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 120px;
}

.submit-btn {
  background-color: #007bff;
  color: white;
}

.submit-btn:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.reset-btn {
  background-color: #6c757d;
  color: white;
}

.reset-btn:hover {
  background-color: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

/* Submit Modal */
.submit-modal-overlay {
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

.submit-modal {
  background-color: white;
  border-radius: 8px;
  max-width: 600px;
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
  color: #2c3e50;
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
  max-height: 500px;
  overflow-y: auto;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #6c757d;
}

.form-data h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.form-data pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  color: #495057;
}

/* Responsive design */
@media (max-width: 768px) {
  .preview-form {
    padding: 16px;
  }

  .form-title-section h2 {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>

<template>
  <div class="form-preview">
    <div class="form-preview__header">
      <h3>Form Preview</h3>
      <p>This is how your form will look to users</p>
    </div>

    <form class="preview-form" @submit.prevent="handleSubmit">
      <div class="form-title-section" v-if="currentSchema">
        <h2>{{ currentSchema.title }}</h2>
        <p v-if="currentSchema.description" class="form-description">
          {{ currentSchema.description }}
        </p>
      </div>

      <div v-if="!hasElements" class="empty-preview">
        <i class="mdi mdi-form-select"></i>
        <p>No form elements to preview</p>
      </div>

      <div v-else class="form-fields">
        <FormElementRenderer
            v-for="element in sortedElements"
            :key="element.id"
            :element="element"
            :preview="true"
        />
      </div>

      <div v-if="hasElements" class="form-actions">
        <button type="submit" class="submit-btn">
          Submit Form
        </button>
        <button type="reset" class="reset-btn">
          Reset
        </button>
      </div>
    </form>

    <!-- Submit Result Modal -->
    <div v-if="showSubmitModal" class="submit-modal-overlay" @click="closeSubmitModal">
      <div class="submit-modal" @click.stop>
        <div class="modal-header">
          <h3>Form Submission</h3>
          <button class="modal-close" @click="closeSubmitModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>This is a preview - form data would be submitted to your backend.</p>
          <div class="form-data">
            <h4>Submitted Data:</h4>
            <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';
import FormElementRenderer from './FormElementRenderer.vue';

/**
 * Form Preview Component
 *
 * Shows a live preview of how the form will appear to end users.
 * Includes form submission handling for demonstration purposes.
 */

const formBuilderStore = useFormBuilderStore();

// Reactive state
const showSubmitModal = ref(false);
const formData = ref<Record<string, any>>({});

// Computed properties
const currentSchema = computed(() => formBuilderStore.currentSchema);
const sortedElements = computed(() => formBuilderStore.sortedElements);
const hasElements = computed(() => formBuilderStore.hasElements);

/**
 * Handle form submission
 */
function handleSubmit(event: Event) {
  const form = event.target as HTMLFormElement;
  const data = new FormData(form);

  // Convert FormData to regular object
  const result: Record<string, any> = {};

  for (const [key, value] of data.entries()) {
    if (key.endsWith('[]')) {
      // Handle checkbox arrays
      const cleanKey = key.slice(0, -2);
      if (!result[cleanKey]) {
        result[cleanKey] = [];
      }
      result[cleanKey].push(value);
    } else if (result[key]) {
      // Handle multiple values for same key
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }

  formData.value = result;
  showSubmitModal.value = true;
}

/**
 * Close submit result modal
 */
function closeSubmitModal() {
  showSubmitModal.value = false;
}
</script>

