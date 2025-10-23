<!-- components/FormBuilder.vue -->

<style scoped>
.form-builder {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.form-builder__toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
  background-color: white;
}

.form-builder__content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.form-builder__sidebar {
  width: 280px;
  flex-shrink: 0;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.form-builder__canvas {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
}

.form-builder__properties {
  width: 320px;
  flex-shrink: 0;
  background-color: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}
</style>

<template>
  <div class="form-builder">
    <div class="form-builder__toolbar">
      <FormBuilderToolbar />
    </div>

    <div class="form-builder__content">
      <!-- Left Panel - Element Library -->
      <div class="form-builder__sidebar">
        <ElementLibrary />
      </div>

      <!-- Center Panel - Form Canvas -->
      <div class="form-builder__canvas">
        <FormCanvas />
      </div>

      <!-- Right Panel - Properties -->
      <div class="form-builder__properties" v-if="!previewMode">
        <ElementProperties />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFormBuilderStore } from '@/stores/formBuilderStore.ts';
import FormBuilderToolbar from './FormBuilderToolbar.vue';
import ElementLibrary from './ElementLibrary.vue';
import FormCanvas from './FormCanvas.vue';
import ElementProperties from './ElementProperties.vue';

/**
 * Main Form Builder Component
 *
 * This is the root component that orchestrates the entire form building experience.
 * It provides a three-panel layout:
 * - Left: Element library with draggable components
 * - Center: Form canvas where elements are dropped and arranged
 * - Right: Properties panel for editing selected elements
 */

const formBuilderStore = useFormBuilderStore();

const previewMode = computed(() => formBuilderStore.previewMode);

// Initialize with a default form if none exists
if (!formBuilderStore.currentSchema) {
  formBuilderStore.createNewForm('New Form', 'Click here to edit description');
}
</script>
