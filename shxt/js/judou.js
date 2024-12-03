
let textBlock = document.getElementById("verttext")

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

if (textBlock) {
    Array.from(textBlock.children).forEach(child => {
        child.innerHTML = punctuate(child.innerHTML);
    });
}
