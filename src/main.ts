import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './style.css'
import './tailwind.css'
import { applyRouteSeo } from './seo'

const app = createApp(App)

app.use(router)

void router.isReady().then(() => {
	applyRouteSeo(router.currentRoute.value)
	app.mount('#app')

	const bootLoader = document.getElementById('boot-loader')
	if (bootLoader) {
		bootLoader.remove()
	}
})
