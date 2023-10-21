let items = document.getElementById("double");
let item1 = items.children[0]
let item2 = items.children[1]

console.log(items)
console.log(item1);
console.log(item2);

function smarten(a) {
    a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
    a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
    a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
    a = a.replace(/"/g, "\u201d");                            // closing doubles
    a = a.replace(/--/g, "\u2014");                           // em-dashes
    a = a.replace(/\*([\w\s]+)\*/g, "<i>$1<\/i>")             // italics
    a = a.replace(/\[\^(\d+)\]/g, "<sup>$1<\/sup>")  // \[$1\]")                   // notes
    return a
  };

function ii (item2) {
    let details = item2.innerHTML
    details = smarten(details)

    let splitdetails = details.split("\n")
    // splitdetails.map(x => x.trim())
    
    splitdetails.forEach(i => console.log(i))
    
    let title = splitdetails[0].trim().slice(2)
    let body = splitdetails.slice(1)
    
    item2.innerHTML = ""
    
    // splitdetails.forEach(i => console.log(i))
    // console.log(title)
    console.log(title.split(""))
    // body.forEach(x => console.log(x))
    
    let sttt = document.createElement("h2")
    sttt.innerText = title
    item2.appendChild(sttt)
    
    body.forEach(paragraph => {
        let am = document.createElement("p")
        am.innerHTML = paragraph.trim()
        item2.appendChild(am)
    });
}

ii(item1)
ii(item2)

