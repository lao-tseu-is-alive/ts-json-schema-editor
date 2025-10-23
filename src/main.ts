import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {createPinia} from "pinia";
import '@mdi/font/css/materialdesignicons.css';

const app =createApp(App);
app.use(createPinia());
app.mount('#app')
