export function collapseSection(targetSection) {
    let sections;
    if (!targetSection) {
        sections = document.querySelectorAll('.panel-section');
    } else if (targetSection instanceof Element) {
        sections = [targetSection];
    } else {
        return;
    }
    if (!sections.length) return;
    for (const section of sections) {
        const children = section.children;
        if (children.length > 3) {
            for (let i = 3; i < children.length; i++) {
                children[i].style.display = "none";
                children[i].style.overflow = "hidden";
            }
            const showNextBentos = section.parentElement.querySelector('.show-next-bentos');
            if (!showNextBentos) return;
            if (showNextBentos.children.length === 0) {
                const collapseBtn = document.createElement('div');
                collapseBtn.style.textAlign = "center";
                collapseBtn.style.fontSize = "1rem";
                collapseBtn.style.padding = "0 0.3rem";
                collapseBtn.style.borderRadius = "5px";
                collapseBtn.style.background = "linear-gradient(145deg, #b5f4da, #98cdb8)";
                collapseBtn.style.boxShadow = "20px 20px 60px #90c2ad, -20px -20px 60px #c2ffeb";
                collapseBtn.style.color = "#1c1c1e";
                collapseBtn.style.transform = "scale(0.8)";
                collapseBtn.style.fontSize = "1rem";
                collapseBtn.style.cursor = "pointer";
                collapseBtn.style.fontWeight = "bold";
                collapseBtn.style.transition = "transform 0.25s ease-in-out";
                collapseBtn.id = `${section.id}-more-btn`;
                collapseBtn.classList.add("active", "collapse-btn");
                collapseBtn.innerText = "+";
                showNextBentos.appendChild(collapseBtn);
                collapseBtn.addEventListener("mouseenter", () => {
                    collapseBtn.style.transform = "scale(0.95)";
                });
                collapseBtn.addEventListener("mouseleave", () => {
                    collapseBtn.style.transform = "scale(0.8)";
                });
            } else {
                const collapseBtn = showNextBentos.children[0];
                collapseBtn.innerText = "+";
                collapseBtn.classList.replace("inactive", "active");
            }
        }
    }
}

export function collapseButton() {
    const collapseButtons = document.querySelectorAll('.collapse-btn');
    if (!collapseButtons.length) return;
    for (const button of collapseButtons) {
        if (!button.classList.contains("active") && !button.classList.contains("inactive") ||
            (button.classList.contains("active") && button.classList.contains("inactive"))) {
            return;
        }
        button.addEventListener('click', () => {
            const section = button.parentElement.previousElementSibling;
            console.log(button.classList.value);
            if (!section || !section.classList.contains('panel-section')) return;
            if (button.classList.contains("active")) {
                const children = section.children;
                for (let i = 0; i < children.length; i++) {
                    children[i].style.display = "initial";
                    children[i].style.overflow = "initial";
                }
                button.innerText = "-";
                button.classList.replace("active", "inactive");
            } else if (button.classList.contains("inactive")) {
                collapseSection(section);
            }
        })
    }
}
