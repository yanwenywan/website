
window.onload = () => {
    let textBlocks = document.getElementsByClassName("juan");
    if (textBlocks.length > 0) {
        for (let i = 0; i < textBlocks.length; i++) {
            // console.log(textBlocks);
            
            textBlocks[i].innerHTML = punctuate(textBlocks[i].innerHTML);
        }
    }

    addScrollButton();

    // allow a tags to headers to scroll properly
    // requires the onpage class
    document.querySelectorAll('.onpage').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ inline: "end", block: "nearest", behavior: "smooth" });
            }
        });
    });

};

window.addEventListener("wheel", event => {
    if (event.shiftKey || event.deltaX !== 0 || event.ctrlKey || event.altKey) {
        return;
    }

    event.preventDefault();

    if (event.deltaY > 0) {
        document.documentElement.scrollLeft -= 50; 
    } else if (event.deltaY < 0) {
        document.documentElement.scrollLeft += 50; 
    }
}, {passive: false})

window.addEventListener('load', manageFiller);
window.addEventListener("load", adjustPadding);
window.addEventListener("load", () => {
    const pageKey = `scroll_amount_${window.location.pathname}`;
    const scrollAmount = sessionStorage.getItem(pageKey);
    if (scrollAmount === null) {
        console.log("no session scroll");
        scrollToHead();
    } else {
        document.documentElement.scrollLeft = parseInt(scrollAmount, 10);
    }
});

window.addEventListener('resize', manageFiller);

let updateScrollTimeout;
window.addEventListener("scroll", () => {
    clearTimeout(updateScrollTimeout);
    updateScrollTimeout = setTimeout(() => {
        const pageKey = `scroll_amount_${window.location.pathname}`;
        sessionStorage.setItem(pageKey, document.documentElement.scrollLeft);
    }, 100);
});

function scrollToHead() {
    if (isMobile()) {
        const header = document.querySelector('header');
        if (header) header.scrollIntoView({ block: 'nearest', inline: 'end', behavior: "smooth" });
    } else {
        document.documentElement.scrollLeft = document.documentElement.scrollWidth;
    }
}

function manageFiller() {
    let cbox = document.querySelector('c-box');
    if (!cbox) return;

    let fillerId = 'cbox-filler-please-ignore';
    let pageWidth = window.innerWidth;

    // Remove existing filler
    let existingFiller = document.getElementById(fillerId);
    if (existingFiller) existingFiller.remove();
    
    let cboxWidth = cbox.offsetWidth;

    // Add filler if necessary
    if (cboxWidth < pageWidth) {
        let filler = document.createElement('div');
        let diff = pageWidth - cboxWidth;

        filler.id = fillerId;
        filler.style.width = `${diff - 20}px`;
        filler.style.height = '1px'; // Minimal height to keep it invisible
        filler.style.pointerEvents = 'none'; // Non-interactive
        cbox.appendChild(filler);
    }
}

function punctuate(text) {
    let properJudou = text
        .replace(/[，]/g, "、").replace(/[；：？！]/g, "。")
        .replace(/([「])/g, '<span class="speechmark start">$1</span>')
        .replace(/([」])/g, '<span class="speechmark end">$1</span>')
    let spanned = properJudou.replace(/([。，、；：])/g, '<span class="judou">$1</span>');
    let commented = spanned.replace(/〔(.*)〕/g, (_, p1) => {
        if (p1.length % 2 !== 0) {
            p1 += '　'; // Add ideographic fullwidth space if odd
        }
        return `<span class="small">${p1}</span>`;
    });
    let titled = commented.replace(/《(.*)》/g, '<span style="text-decoration: underline wavy var(--mutedred);">$1</span>');
    return titled
}

function adjustPadding() {
    let ol = document.querySelector('.juan ol');
    if (!ol) return;

    let itemCount = ol.children.length;
    let maxDigits = String(itemCount).length;

    // Base padding plus 1.2em for each digit above 1
    let basePadding = 2.4; // in em
    let extraPadding = (maxDigits - 1) * 1.2; // in em
    let totalPadding = basePadding + extraPadding;

    // Apply calculated padding
    ol.style.paddingTop = `${totalPadding}em`;
}

function addScrollButton() {
    const button = document.createElement("button");
    button.className = "return-button";

    button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(34, 34, 34, 0.4)";
    });

    button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(34, 34, 34, 0.2)";
    });

    button.addEventListener("mousedown", () => {
        button.style.background = "rgba(34, 34, 34, 0.5)";
    });

    button.addEventListener("mouseup", () => {
        button.style.background = "rgba(34, 34, 34, 0.4)";
    });

    button.addEventListener("click", () => {
        scrollToHead();
    });

    button.textContent = "反回卷頭 →";
    document.body.appendChild(button);
}

function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
}
