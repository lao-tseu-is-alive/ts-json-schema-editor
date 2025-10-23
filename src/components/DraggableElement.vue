<!-- components/DraggableElement.vue -->

<style scoped>
.draggable-element {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.draggable-element:hover {
  background-color: #e9ecef;
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.draggable-element:active {
  cursor: grabbing;
  transform: translateY(0);
}

.element-icon {
  margin-right: 12px;
  font-size: 18px;
  color: #007bff;
  width: 20px;
  text-align: center;
}

.element-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}
</style>

<template>
  <div
      class="draggable-element"
      draggable="true"
      @dragstart="onDragStart"
      @dragend="onDragEnd"
  >
    <div class="element-icon">
      <i :class="item.icon"></i>
    </div>
    <div class="element-label">
      {{ item.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';
import type { DragItem } from '@/types/formBuilder.ts';

/**
 * Draggable Element Component
 *
 * Represents a draggable form element in the library.
 * Handles drag start/end events and visual feedback.
 */

interface Props {
  item: DragItem;
}


const formBuilderStore = useFormBuilderStore();
const props = defineProps<Props>();
/**
 * Handle drag start event
 */
function onDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.item.type);
    event.dataTransfer.effectAllowed = 'copy';
  }
  formBuilderStore.isDragging = true;
}

/**
 * Handle drag end event
 */
function onDragEnd() {
  formBuilderStore.isDragging = false;
}


</script>
