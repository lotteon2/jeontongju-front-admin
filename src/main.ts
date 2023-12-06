import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { loadFonts } from './plugins/webfontloader'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

loadFonts()

createApp(App).use(router).use(Toast).mount('#app')
