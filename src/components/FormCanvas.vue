<!-- components/FormCanvas.vue -->
<style scoped>
.form-canvas {
  min-height: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-canvas__header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.form-header {
  cursor: pointer;
  border-radius: 4px;
  padding: 16px;
  transition: background-color 0.2s;
}

.form-header:hover {
  background-color: #f8f9fa;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.form-title.editable {
  background-color: #fff;
  border: 2px solid #007bff;
  padding: 4px 8px;
  border-radius: 4px;
}

.form-description {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.form-description.editable {
  background-color: #fff;
  border: 2px solid #007bff;
  padding: 4px 8px;
  border-radius: 4px;
}

.form-canvas__drop-zone {
  min-height: 400px;
  padding: 20px;
  border: 2px dashed transparent;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 20px;
}

.form-canvas__drop-zone.drag-over {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.form-canvas__drop-zone.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  color: #6c757d;
}

.empty-state__icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.form-elements {
  space-y: 16px;
}

.form-preview {
  padding: 20px;
}
</style>

<template>
  <div class="form-canvas">
    <!-- Form Header -->
    <div class="form-canvas__header">
      <div class="form-header" @click="selectFormHeader">
        <h2 class="form-title" :class="{ 'editable': isEditingTitle }"
            @click.stop="startEditingTitle"
            @blur="finishEditingTitle"
            @keydown.enter="finishEditingTitle"
            :contenteditable="isEditingTitle">
          {{ formBuilderStore.currentSchema?.title || 'Untitled Form' }}
        </h2>

        <p class="form-description" :class="{ 'editable': isEditingDescription }"
           @click.stop="startEditingDescription"
           @blur="finishEditingDescription"
           @keydown.enter="finishEditingDescription"
           :contenteditable="isEditingDescription">
          {{ formBuilderStore.currentSchema?.description || 'Click to add description' }}
        </p>
      </div>
    </div>

    <!-- Drop Zone -->
    <div
        class="form-canvas__drop-zone"
        :class="{ 'drag-over': isDragOver, 'empty': !hasElements }"
        @drop="onDrop"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
    >
      <!-- Empty State -->
      <div v-if="!hasElements" class="empty-state">
        <div class="empty-state__icon">
          <i class="mdi mdi-form-select"></i>
        </div>
        <h3>Start Building Your Form</h3>
        <p>Drag form elements from the sidebar to create your form</p>
      </div>

      <!-- Form Elements -->
      <div v-else class="form-elements">
        <FormElementWrapper
            v-for="element in sortedElements"
            :key="element.id"
            :element="element"
            :is-selected="selectedElement?.id === element.id"
            @select="selectElement"
            @delete="deleteElement"
            @duplicate="duplicateElement"
        />
      </div>
    </div>

    <!-- Preview Mode -->
    <div v-if="previewMode" class="form-preview">
      <FormPreview />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';
import FormElementWrapper from './FormElementWrapper.vue';
import FormPreview from './FormPreview.vue';

/**
 * Form Canvas Component
 *
 * The main drop zone where form elements are arranged and edited.
 * Handles drag and drop operations and element management.
 */

const formBuilderStore = useFormBuilderStore();

// Reactive state
const isDragOver = ref(false);
const isEditingTitle = ref(false);
const isEditingDescription = ref(false);

// Computed properties
const sortedElements = computed(() => formBuilderStore.sortedElements);
const hasElements = computed(() => formBuilderStore.hasElements);
const selectedElement = computed(() => formBuilderStore.selectedElement);
const previewMode = computed(() => formBuilderStore.previewMode);

/**
 * Handle drop event - add new element to form
 */
function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;

  const elementType = event.dataTransfer?.getData('text/plain');
  if (elementType) {
    formBuilderStore.addElement(elementType as any);
  }
}

/**
 * Handle drag over event
 */
function onDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

/**
 * Handle drag leave event
 */
function onDragLeave() {
  isDragOver.value = false;
}

/**
 * Select an element for editing
 */
function selectElement(elementId: string) {
  formBuilderStore.selectElement(elementId);
}

/**
 * Delete an element
 */
function deleteElement(elementId: string) {
  formBuilderStore.removeElement(elementId);
}

/**
 * Duplicate an element
 */
function duplicateElement(elementId: string) {
  const element = sortedElements.value.find(el => el.id === elementId);
  if (element) {
    const newElement = { ...element, id: `${element.id}_copy`, name: `${element.name}_copy` };
    formBuilderStore.addElement(element.type);
    // Update with copied properties
    setTimeout(() => {
      const newElementInstance = formBuilderStore.sortedElements[formBuilderStore.sortedElements.length - 1];
      if (newElementInstance) {
        formBuilderStore.updateElement(newElementInstance.id, newElement);
      }
    }, 0);
  }
}

/**
 * Form header editing functions
 */
function selectFormHeader() {
  formBuilderStore.selectElement(null);
}

function startEditingTitle() {
  isEditingTitle.value = true;
}

function finishEditingTitle(event: Event) {
  isEditingTitle.value = false;
  const target = event.target as HTMLElement;
  if (formBuilderStore.currentSchema) {
    formBuilderStore.currentSchema.title = target.textContent || 'Untitled Form';
  }
}

function startEditingDescription() {
  isEditingDescription.value = true;
}

function finishEditingDescription(event: Event) {
  isEditingDescription.value = false;
  const target = event.target as HTMLElement;
  if (formBuilderStore.currentSchema) {
    formBuilderStore.currentSchema.description = target.textContent || '';
  }
}
</script>

