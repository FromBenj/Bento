import {updateBentoCategory} from './bento-handling.js';

export function dragDropHandling() {
    bentoDragging();
    bentoDropping();
}

function bentoDragging() {
    const bentoElements = document.querySelectorAll('.bento');
    if (!bentoElements.length) return;
    const bentos = Array.from(bentoElements);
    bentos.forEach((bento) => {
        bento.addEventListener('dragstart', (e) => {
            setDragImage(e);
            const bentoId = e.target.dataset.id;
            if (bentoId) {
                e.dataTransfer.setData("text/plain", bentoId);
            }
        })
    })
}

function bentoDropping() {
    const sectionContainers = document.querySelectorAll('.section-container');
    if (!sectionContainers.length) return;
    Array.from(sectionContainers).forEach((sectionContainer) => {
        sectionContainer.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        sectionContainer.addEventListener("dragenter", () => {
            sectionContainer.classList.add("drop-mode");
        });
        sectionContainer.addEventListener("dragleave", () => {
            sectionContainer.classList.remove("drop-mode");
        });
        sectionContainer.addEventListener("drop", async (e) => {
            e.preventDefault();
            sectionContainer.classList.remove("drop-mode");
            const bentoId = e.dataTransfer.getData("text/plain");
            const bentoElement = document.querySelector(`[data-id="${bentoId}"]`);
            if (bentoElement) {
                const section = sectionContainer.querySelector('.panel-section');
                section.append(bentoElement);
                const newCategory = section.id;
                await updateBentoCategory(bentoId, newCategory);
            }
        });
    })
}

const setDragImage = (e) => {
    const image = document.createElement('span');
    image.innerText = e.target.dataset.label ?? 'Item';
    const bentoName = e.target.querySelector('.name-input');
    image.innerText = bentoName ? '🍱  ' + bentoName.innerText.trim() : '🍱  Bento';
    document.body.appendChild(image);
    e.dataTransfer.setDragImage(image, 25, 25);
    requestAnimationFrame(() => image.remove());
}
