// src/frontend/main.ts
import { createApp } from "vue";

const app = createApp({
	data() {
		return {
			message: "Hello from Vue with TypeScript!",
		};
	},
});

app.mount("#app");
