
var showdownScript = document.createElement('script');  
showdownScript.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js');
showdownScript.onload = main 
document.head.appendChild(showdownScript);


// defs 
const lastChap = "上一章"
const content = "目录"
const nextChap = "下一章"
const footerText = `且看能写多少吧`


function smarten(a) {
	a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
	a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
	a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
	a = a.replace(/"/g, "\u201d");                            // closing doubles
	// a = a.replace(/--/g, "\u2014");                           // em-dashes
	// a = a.replace(/\*([\w\s]+)\*/g, "<i>$1<\/i>")             // italics
	// a = a.replace(/\[\^(\d+)\]/g, "<sup>$1<\/sup>")  // \[$1\]")                   // notes
	return a
};

function preprocess(a) {
	a = a.replace(/\[\^(\d+)\](?!:)/g, "<sup>[$1]<\/sup>"); //"&#91;");      // [
	a = a.replace(/\[\^(\d+)\]:/g, "【$1】 "); //"&#93;");      // ]
	return a
};


  function makefootnotes() {
	'use strict';
	var footNoteMap = {};

	var footNoteMarks = document.querySelectorAll("sup");

	var footNote = document.querySelector("body>div#double>p:last-child");

	var content = footNote.innerHTML.trim();  //TODO
	var patt = /【(\d+)】([^【]+)/g;
	var match;
	var footNoteDescCount = 0;
	while (match = patt.exec(content)) {
		footNoteDescCount++;
		footNoteMap[match[1]] = match[2].trim()
	}

	if(footNoteMarks.length && footNoteDescCount){
		footNoteMarks.forEach(function(fnMark){
			var footNoteDisplayNumber = fnMark.textContent
			var footNoteNumber = footNoteDisplayNumber.substring(1, footNoteDisplayNumber.length-1);

			var anchor = document.createElement('a');
			anchor.textContent = footNoteDisplayNumber;
			fnMark.textContent = undefined;
			fnMark.appendChild(anchor);
			fnMark.style.cursor = 'pointer';
			anchor.onclick = function(evt){
				var backdrop = document.createElement('div');
				backdrop.style.position = 'fixed';
				backdrop.style.top = '0';
				backdrop.style.left = '0';
				backdrop.style.height = '100%';
				backdrop.style.width = '100%';
				backdrop.style.margin = 'auto';
				backdrop.style.display = 'flex';
				backdrop.style.alignItems = 'center';

				backdrop.style.backgroundColor = 'black';

				backdrop.style.background = 'rgba(0, 0, 0, 0.7)'

				var body = document.querySelector('body');
				body.appendChild(backdrop);

				var footNoteContent = document.createElement('div');
				footNoteContent.classList.add('double')
				footNoteContent.classList.add("thin")
				footNoteContent.style.paddingBottom = '0';
				footNoteContent.style.border = "1px solid var(--green)";
				var footNoteText = document.createElement('p');
				footNoteText.innerHTML = footNoteMap[footNoteNumber];
				footNoteContent.appendChild(footNoteText);


				var closeButtonGroup = document.createElement('div');
				footNoteContent.appendChild(closeButtonGroup);
				closeButtonGroup.classList.add('threecol');

				// Add dummy elems for alignment
				var leftDummy = document.createElement('p');
				leftDummy.classList.add('left');
				closeButtonGroup.appendChild(leftDummy);

				var centerDummy = document.createElement('p');
				centerDummy.classList.add('center');
				closeButtonGroup.appendChild(centerDummy);


				var closeButtonRight = document.createElement('p');
				closeButtonRight.classList.add('right');
				closeButtonGroup.appendChild(closeButtonRight);

				var closeButton = document.createElement('a');
				closeButton.style.cursor = 'pointer';
				closeButton.textContent = 'Close';
				closeButtonRight.appendChild(closeButton);
				closeButton.onclick = function(){backdrop.remove()}

				backdrop.appendChild(footNoteContent);
				backdrop.onclick = function(e){
					if(backdrop === e.target){
					  backdrop.remove();
					}
				}

			}
		});
	}
}


function main() {

	let ops =  showdown.getOptions()
	console.log(ops);

	let converter = new showdown.Converter()
	// converter.

	// get current file name
	let url = window.location.pathname;
	let currentFile = url.substring(url.lastIndexOf("/")+1);
	let currentFileNumber = parseInt(currentFile.split(".")[0]);
	// alert(currentFileNumber)
	
	let elem = document.getElementById("double")
	elem.textContent = preprocess(elem.textContent);
	let converted = converter.makeHtml(elem.textContent)
	elem.innerHTML = converted;
	elem.innerHTML = smarten(elem.innerHTML);
	// elem.innerHTML = MarkdownToHtml.parse(elem.innerHTML);
	
	
	
	let footer = document.getElementById("footer")
	
	footer.innerHTML = ""
	
	let links = document.createElement("div")
	links.className = "threecol"
	links.setAttribute("overflow", "none")
	// do links
	let lp = document.createElement("p")
	// lp.setAttribute("overflow", "none")
	if (currentFileNumber > 1) {
		let backLink = document.createElement("a")
		backLink.href = "./" + (currentFileNumber-1) + ".html"
		backLink.innerText = lastChap
		lp.appendChild(backLink)
	} 
	links.appendChild(lp)
	
	let mp = document.createElement("p")
	mp.classList.add("centre")
	let homeLink = document.createElement("a")
	homeLink.href = "../"
	homeLink.innerText = content;
	mp.appendChild(homeLink)
	links.appendChild(mp)
	
	
	// Check if next page exists
	let nl = "./" + (currentFileNumber+1) + ".html"
	let req = new XMLHttpRequest();
	req.open("GET",nl);
	req.onreadystatechange = function(){
		if(req.readyState === 4 && req.status === 200){
			let rp = document.createElement("p")
			rp.classList.add("right")
			let nextLink = document.createElement("a")
			nextLink.href = nl;
			nextLink.innerText = nextChap
			rp.appendChild(nextLink)
			links.appendChild(rp)
		}
	}
	req.send();
	// end
	
	footer.appendChild(links)
	
	let p = document.createElement("p")
	p.className = "small"
	p.innerHTML = footerText
	
	let show = true
	
	if (show) {
		footer.appendChild(p)
	}
	
	// ================================================================================================================================
	// thanks fear
	// (makes footnotes popupable)

	makefootnotes();
	
}





