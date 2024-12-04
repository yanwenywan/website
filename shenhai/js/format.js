
window.onload = () => {
    
    let textBlocks = document.getElementsByClassName("juan");
    if (textBlocks.length > 0) {
        for (let i = 0; i < textBlocks.length; i++) {
            console.log(textBlocks);
            
            textBlocks[i].innerHTML = punctuate(textBlocks[i].innerHTML);
        }
    }

};

window.addEventListener("wheel", event => {
    if (event.shiftKey || event.deltaX !== 0 || event.ctrlKey || event.altKey) {
        return;
    }

    event.preventDefault();

    if (event.deltaY > 0) {
        document.documentElement.scrollLeft -= 50; // Adjust scroll amount as needed
    } else if (event.deltaY < 0) {
        document.documentElement.scrollLeft += 50; // Adjust scroll amount as needed
    }
}, {passive: false})

window.addEventListener('load', manageFiller);
window.addEventListener("load", adjustScroll)
window.addEventListener("load", adjustPadding)

window.addEventListener('resize', manageFiller);

// run when the list changes dynamically (which is unlikely)
const olPaddingObserver = new MutationObserver(adjustPadding);
olPaddingObserver.observe(document.querySelector('.juan ol'), { childList: true });


function adjustScroll() {
    if (document.documentElement.scrollLeft === 0) {
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
    let properJudou = text.replace(/[，]/g, "、").replace(/[；：？！]/g, "。").replace(/[「」]/g, "")
    let spanned = properJudou.replace(/([。，、；：「」])/g, '<span class="judou">$1</span>');
    let commented = spanned.replace(/〔(.*)〕/g, (match, p1) => {
        if (p1.length % 2 !== 0) {
            p1 += '　'; // Add ideographic fullwidth space if odd
        }
        return `<span class="small">${p1}</span>`;
    });
    return commented
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
