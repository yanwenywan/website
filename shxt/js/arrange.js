let item2 = document.getElementById("verttext");
let details = item2.innerHTML
let splitdetails = details.split("\n\n")
// splitdetails.map(x => x.trim())

// splitdetails.forEach(i => console.log(i))

let title = splitdetails[0].trim().slice(5)
let body = splitdetails.slice(1)

item2.innerHTML = ""

// splitdetails.forEach(i => console.log(i))
// console.log(title)
console.log(title.split(""))
// body.forEach(x => console.log(x))

let sttt = document.createElement("h2")
sttt.innerText = title
item2.appendChild(sttt)

function punctuate(paragraph) {
    judoudPar = paragraph.replace(/([。，、；：「」])/g, '<span class="judou">$1</span>');

    return judoudPar;
}

body.forEach(paragraph => {
    let am = document.createElement("p")
    trimmedPar = paragraph.trim()
    am.innerText = punctuate(trimmedPar)
    item2.appendChild(am)
});
