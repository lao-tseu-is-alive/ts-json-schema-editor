
-----

# ts-json-schema-editor

[](https://opensource.org/licenses/MIT)

`ts-json-schema-editor` is a modern, web-based visual editor for building and editing **JSON Schemas**. Built with Vue 3, TypeScript, and Pinia, this tool transforms the complex task of writing JSON Schema by hand into an intuitive drag-and-drop experience.

You can visually build a form, and the corresponding schema is generated for you. You can also **import an existing JSON Schema** to modify it using the visual editor and **export** it back out.

## ✨ Features

Based on the project's components and store logic, here are the core features:

* **Visual Form Builder:** Drag-and-drop elements from a component library onto a canvas to build your form.
* **JSON Schema Import/Export:** Seamlessly import an existing JSON Schema to edit, and export your visual form back to a clean JSON Schema file at any time.
* **Live Preview:** Instantly toggle to a "Preview" mode to see and interact with your rendered form exactly as a user would.
* **Rich Property Editing:** Select any element to configure its label, field name, description, placeholder, and validation rules (like "Required", "Min/Max Length", "Regex Pattern").
* **Comprehensive Element Support:** Includes a wide range of standard form elements:
    * Text, Email, Password, Text Area
    * Number, Range Slider
    * Date, DateTime, Time
    * Select (Dropdown), Radio Group, Checkbox Group
* **Element Management:** Easily duplicate, delete, and re-order elements on the canvas.
* **Form Validation:** A built-in validator checks for common issues like duplicate field names before you export.

## 🛠️ Tech Stack

This project is built with a modern, type-safe stack:

* **[Vue 3](https://vuejs.org/)** (Composition API with `<script setup>`)
* **[TypeScript](https://www.typescriptlang.org/)**
* **[Pinia](https://pinia.vuejs.org/)** for clean, centralized state management
* **[Vite](https://vitejs.dev/)** for fast, modern development and bundling
* **[@mdi/font](https://materialdesignicons.com/)** for icons

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v22.17.1 or compatible
* **NPM** (comes with Node.js)

### Installation & Development

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/lao-tseu-is-alive/ts-json-schema-editor.git
    cd ts-json-schema-editor
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Run the development server:**

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:5173` (or the next available port).

### Building for Production

To create a production-ready build:

```sh
npm run build
```

This will compile the application and output static files to the `dist/` directory.

## 📂 Project Structure

The project follows a standard Vue 3 + TypeScript structure:

```
src/
├── assets/         # Static assets
├── components/     # All Vue components
│   ├── FormBuilder.vue     # Main 3-panel layout
│   ├── FormCanvas.vue      # Center drop zone
│   ├── ElementLibrary.vue  # Left-side element list
│   ├── ElementProperties.vue # Right-side property editor
│   ├── FormPreview.vue     # Preview mode component
│   └── ...
├── stores/         # Pinia state management
│   └── formBuilderStore.ts # Core logic and state
├── types/          # TypeScript type definitions
│   └── formBuilder.ts 
├── utils/          # Utility functions
│   └── formUtils.ts   
├── App.vue         # Root Vue component
├── main.ts         # Application entry point
└── style.css       # Global styles
```

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
