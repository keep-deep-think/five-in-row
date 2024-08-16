import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import AntD from "ant-design-vue";
createApp(App)
  .use(AntD)
  .mount("#app")
  .$nextTick(() => {
    // Use contextBridge
    window.ipcRenderer.on("main-process-message", (_event, message) => {
      console.log(message);
    });
  });
