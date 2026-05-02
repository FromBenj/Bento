import {BentoHandling} from "./js/bento-handling.js";
import {dragDropHandling} from "./js/drag-and-drop.js";


document.addEventListener('DOMContentLoaded', async () => {
    await BentoHandling();
    dragDropHandling();
})

console.log("frontend.js is running! 🙌");
