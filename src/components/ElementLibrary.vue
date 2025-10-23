<!-- components/ElementLibrary.vue -->
<style scoped>
.element-library {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.element-library__header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.element-library__header h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.element-library__header p {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.element-library__content {
  flex: 1;
  overflow-y: auto;
}

.element-search {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.element-categories {
  padding: 16px;
}

.category {
  margin-bottom: 24px;
}

.category__title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category__items {
  display: grid;
  gap: 8px;
}
</style>

<template>
  <div class="element-library">
    <div class="element-library__header">
      <h3>Form Elements</h3>
      <p>Drag elements to the canvas</p>
    </div>

    <div class="element-library__content">
      <!-- Search/Filter -->
      <div class="element-search">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search elements..."
            class="search-input"
        >
      </div>

      <!-- Element Categories -->
      <div class="element-categories">
        <!-- Basic Input Elements -->
        <div class="category">
          <h4 class="category__title">Basic Inputs</h4>
          <div class="category__items">
            <DraggableElement
                v-for="item in filteredBasicElements"
                :key="item.type"
                :item="item"
            />
          </div>
        </div>

        <!-- Advanced Input Elements -->
        <div class="category">
          <h4 class="category__title">Advanced Inputs</h4>
          <div class="category__items">
            <DraggableElement
                v-for="item in filteredAdvancedElements"
                :key="item.type"
                :item="item"
            />
          </div>
        </div>

        <!-- Selection Elements -->
        <div class="category">
          <h4 class="category__title">Selection</h4>
          <div class="category__items">
            <DraggableElement
                v-for="item in filteredSelectionElements"
                :key="item.type"
                :item="item"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DRAG_ITEMS } from '@/utils/formUtils.ts';
import DraggableElement from './DraggableElement.vue';

/**
 * Element Library Component
 *
 * Displays available form elements that can be dragged to the canvas.
 * Elements are organized by categories for better user experience.
 */

const searchQuery = ref('');

// Categorized elements
const basicElements = DRAG_ITEMS.filter(item =>
    ['text', 'email', 'password', 'textarea', 'number'].includes(item.type)
);

const advancedElements = DRAG_ITEMS.filter(item =>
    ['range', 'date', 'datetime', 'time'].includes(item.type)
);

const selectionElements = DRAG_ITEMS.filter(item =>
    ['select', 'radio', 'checkbox'].includes(item.type)
);

// Filtered elements based on search
const filteredBasicElements = computed(() =>
    basicElements.filter(item =>
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
);

const filteredAdvancedElements = computed(() =>
    advancedElements.filter(item =>
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
);

const filteredSelectionElements = computed(() =>
    selectionElements.filter(item =>
        item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
);
</script>

