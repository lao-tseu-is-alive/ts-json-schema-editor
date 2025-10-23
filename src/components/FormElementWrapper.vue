<!-- components/FormElementWrapper.vue -->
<style scoped>
.form-element-wrapper {
  position: relative;
  margin: 16px 0;
  border: 2px solid transparent;
  border-radius: 8px;
  background-color: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.form-element-wrapper:hover {
  border-color: #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-element-wrapper.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-element-wrapper.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.form-element-wrapper.drag-over {
  border-color: #28a745;
  background-color: #f8fff8;
}

.element-controls {
  position: absolute;
  top: -12px;
  right: 8px;
  z-index: 10;
}

.control-buttons {
  display: flex;
  gap: 4px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.control-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.danger {
  color: #dc3545;
}

.control-btn.danger:hover {
  background-color: #dc3545;
  color: white;
}

.drop-indicator {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 4px;
  z-index: 5;
}

.drop-line {
  height: 2px;
  background-color: #28a745;
  border-radius: 1px;
}

.element-content {
  padding: 20px;
}

.element-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.element-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-type {
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.required-badge {
  background-color: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.element-form-field {
  margin: 12px 0;
}

.element-footer {
  padding: 8px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 6px 6px;
}

.element-name {
  font-size: 12px;
  color: #6c757d;
  font-family: 'Courier New', monospace;
}

/* Animation for element insertion */
.form-element-wrapper {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<template>
  <div
      class="form-element-wrapper"
      :class="{
      'selected': isSelected,
      'dragging': isDragging,
      'drag-over': isDragOver
    }"
      @click.stop="selectElement"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
      @dragover.prevent="onDragOver"
      @drop.prevent="onDrop"
      @dragleave="onDragLeave"
      draggable="true"
  >
    <!-- Element Controls -->
    <div class="element-controls" v-if="isSelected">
      <div class="control-buttons">
        <button @click.stop="moveUp" :disabled="!canMoveUp" class="control-btn">
          <i class="mdi mdi-arrow-up"></i>
        </button>
        <button @click.stop="moveDown" :disabled="!canMoveDown" class="control-btn">
          <i class="mdi mdi-arrow-down"></i>
        </button>
        <button @click.stop="duplicateElement" class="control-btn">
          <i class="mdi mdi-content-copy"></i>
        </button>
        <button @click.stop="deleteElement" class="control-btn danger">
          <i class="mdi mdi-delete"></i>
        </button>
      </div>
    </div>

    <!-- Drop Zone Indicator (when dragging over) -->
    <div v-if="isDragOver && !isDragging" class="drop-indicator">
      <div class="drop-line"></div>
    </div>

    <!-- Form Element Content -->
    <div class="element-content">
      <!-- Element Label and Info -->
      <div class="element-header">
        <div class="element-info">
          <span class="element-type">{{ getElementTypeLabel(element.type) }}</span>
          <span v-if="element.required" class="required-badge">Required</span>
        </div>
      </div>

      <!-- Actual Form Element -->
      <div class="element-form-field">
        <FormElementRenderer :element="element" :preview="false" />
      </div>
    </div>

    <!-- Element Footer with Name -->
    <div class="element-footer" v-if="isSelected">
      <span class="element-name">{{ element.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';
import type { FormElement } from '@/types/formBuilder.ts';
import FormElementRenderer from './FormElementRenderer.vue';

/**
 * Form Element Wrapper Component
 *
 * Wraps individual form elements with editing controls and drag/drop functionality.
 * Provides visual feedback for selection, dragging, and drop zones.
 */

interface Props {
  element: FormElement;
  isSelected: boolean;
}

interface Emits {
  (e: 'select', elementId: string): void;
  (e: 'delete', elementId: string): void;
  (e: 'duplicate', elementId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formBuilderStore = useFormBuilderStore();

// Reactive state
const isDragging = ref(false);
const isDragOver = ref(false);

// Computed properties
const sortedElements = computed(() => formBuilderStore.sortedElements);
const elementIndex = computed(() =>
    sortedElements.value.findIndex(el => el.id === props.element.id)
);
const canMoveUp = computed(() => elementIndex.value > 0);
const canMoveDown = computed(() => elementIndex.value < sortedElements.value.length - 1);

/**
 * Get human-readable label for element type
 */
function getElementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: 'Text',
    email: 'Email',
    password: 'Password',
    textarea: 'Text Area',
    number: 'Number',
    range: 'Range',
    date: 'Date',
    datetime: 'Date Time',
    time: 'Time',
    select: 'Select',
    radio: 'Radio Group',
    checkbox: 'Checkbox Group',
  };
  return labels[type] || type;
}

/**
 * Select this element
 */
function selectElement() {
  emit('select', props.element.id);
}

/**
 * Move element up in order
 */
function moveUp() {
  if (!canMoveUp.value) return;
  const newOrder = sortedElements.value[elementIndex.value - 1].order;
  formBuilderStore.reorderElement(props.element.id, newOrder);
}

/**
 * Move element down in order
 */
function moveDown() {
  if (!canMoveDown.value) return;
  const newOrder = sortedElements.value[elementIndex.value + 1].order;
  formBuilderStore.reorderElement(props.element.id, newOrder);
}

/**
 * Duplicate this element
 */
function duplicateElement() {
  emit('duplicate', props.element.id);
}

/**
 * Delete this element
 */
function deleteElement() {
  emit('delete', props.element.id);
}

/**
 * Handle drag start
 */
function onDragStart(event: DragEvent) {
  isDragging.value = true;
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', `element:${props.element.id}`);
    event.dataTransfer.effectAllowed = 'move';
  }
}

/**
 * Handle drag end
 */
function onDragEnd() {
  isDragging.value = false;
}

/**
 * Handle drag over
 */
function onDragOver() {
  isDragOver.value = true;
}

/**
 * Handle drag leave
 */
function onDragLeave() {
  isDragOver.value = false;
}

/**
 * Handle drop
 */
function onDrop(event: DragEvent) {
  isDragOver.value = false;

  const data = event.dataTransfer?.getData('text/plain');
  if (!data) return;

  if (data.startsWith('element:')) {
    // Reordering existing element
    const draggedElementId = data.replace('element:', '');
    if (draggedElementId !== props.element.id) {
      formBuilderStore.reorderElement(draggedElementId, props.element.order);
    }
  } else {
    // Adding new element from library
    formBuilderStore.addElement(data as any, props.element.order);
  }
}
</script>

