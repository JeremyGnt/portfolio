import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './style.css'

createApp(App).use(router).mount('#app')

const bootLoader = document.getElementById('boot-loader')
if (bootLoader) {
	bootLoader.remove()
}
