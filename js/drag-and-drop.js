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
            const bentoId = e.target.dataset.id;
            if (bentoId) {
                e.dataTransfer.setData("text/plain", bentoId);
            }
        })
    })
}

function bentoDropping() {
    const panelSections = document.querySelectorAll('.panel-section');
    if (!panelSections.length) return;
    Array.from(panelSections).forEach((section) => {
        section.addEventListener("dragover", (e) => {
            e.preventDefault();
        });
        section.addEventListener("dragenter", () => {
            section.classList.add("drag-hover");
        });
        section.addEventListener("dragleave", () => {
            section.classList.remove("drag-hover");
        });
        section.addEventListener("drop", (e) => {
            e.preventDefault();
            console.log("drag drop")
            section.classList.remove("drag-hover");
            const bentoId = e.dataTransfer.getData("text/plain");
            const bentoElement = document.querySelector(`[data-id="${bentoId}"]`);
            if (bentoElement) {
                     section.append(bentoElement);
            }
        });
    })
}
