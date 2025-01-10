
// showdown md
var showdownScript = document.createElement('script');
showdownScript.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js');
showdownScript.onload = main
document.head.appendChild(showdownScript);

// defs 
const lastChap = "Back"
const content = "Home"
const nextChap = "Next"
const footerText = `If you want to talk with other readers about Nightwatchers (or other cultivation type books) you can join 
our <a href='https://discord.gg/fVj6Ab9pSM'>cultivation groupreading discord server</a>!
<br><br>
I also have a Kofi, which for legal reasons is definitely for supporting my digital art only (promise!): 
<a href='https://ko-fi.com/yanxin'>ko-fi.com/yanxin</a> ... 
plus I guess server space isn't free, and I don't want to put ads/trackers... ever, so thank you if you do!`

// this is necessary because nextLink is generated asynchronously and js doesn't reflect that in function arguments
var nextLink = null;


function main() {

	let converter = new showdown.Converter()

	let currentFileNumber = getCurrentChapterNumber();

	convertBodyMd(document.getElementById("double"), converter);

	makeFooter(currentFileNumber);

	makefootnotes();

}

function getCurrentChapterNumber() {
	let url = window.location.pathname;
	let currentFile = url.substring(url.lastIndexOf("/") + 1);
	return parseInt(currentFile.split(".")[0]);
}

function convertBodyMd(bodyTextElement, converter) {
	bodyTextElement.textContent = preprocessFootnoteIcons(bodyTextElement.textContent);
	bodyTextElement.textContent = smartenQuotes(bodyTextElement.textContent);
	let converted = converter.makeHtml(bodyTextElement.textContent)
	bodyTextElement.innerHTML = converted;
	// bodyTextElement.innerHTML = smartenQuotes(bodyTextElement.innerHTML);
}

function smartenQuotes(a) {
	a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018"); // opening singles
	a = a.replace(/(^|[-\u2014\s(\['])"/g, "$1\u201c"); // opening doubles
	a = a.replace(/'/g, "\u2019"); // closing singles & apostrophes
	a = a.replace(/"/g, "\u201d"); // closing doubles
	return a
};

function preprocessFootnoteIcons(a) {
	a = a.replace(/\[\^(\d+)\](?!:)/g, "<sup>【$1】<\/sup>"); // footnotes
	a = a.replace(/\[\^(\d+)\]:/g, "【$1】 "); // footnotes
	return a
};

function makeFooter(currentFileNumber) {
	let footer = document.getElementById("footer")

	footer.innerHTML = ""

	let links = document.createElement("div")
	links.className = "threecol"
	links.setAttribute("overflow", "none")

	let backLink = addPreviousPageLinkIfExists(links, currentFileNumber);

	addHomeLink(links);

	addNextPageLinkIfExists(links, currentFileNumber)

	footer.appendChild(links)

	addUtterancesCommentThread(footer);

	footer.appendChild(makeFooterSmallText())
	
	addNavLinkListener(backLink);
}

function addPreviousPageLinkIfExists(linksElement, currentFileNumber) {
	let leftParagraph = document.createElement("p")
	let backLink = null;
	if (currentFileNumber > 1) {
		backLink = document.createElement("a")
		backLink.href = "./" + (currentFileNumber - 1) + ".html"
		backLink.innerText = lastChap
		leftParagraph.appendChild(backLink)
	}
	linksElement.appendChild(leftParagraph)
	return backLink;
}

function addHomeLink(linksElement) {
	let middleParagraph = document.createElement("p")
	middleParagraph.classList.add("centre")
	let homeLink = document.createElement("a")
	homeLink.href = "../"
	homeLink.innerText = content;
	middleParagraph.appendChild(homeLink)
	linksElement.appendChild(middleParagraph)
	return homeLink;
}

function addNextPageLinkIfExists(linksElement, currentFileNumber) {
	let nl = "./" + (currentFileNumber + 1) + ".html"
	let req = new XMLHttpRequest();
	req.open("GET", nl);
	req.onreadystatechange = function () {
		if (req.readyState === 4 && req.status === 200) {
			let rp = document.createElement("p")
			rp.classList.add("right")
			nextLink = document.createElement("a")
			nextLink.href = nl;
			nextLink.innerText = nextChap
			rp.appendChild(nextLink)
			linksElement.appendChild(rp)
		}
	}
	req.send();
}

function makeFooterSmallText() {
	let p = document.createElement("p")
	p.className = "small"
	p.innerHTML = footerText
	return p
}

function addNavLinkListener(backLink) {
	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowLeft" && backLink != null) {
			window.location.href = backLink.href;
		}
		if (e.key === "ArrowRight" && nextLink != null) {
			window.location.href = nextLink.href;
		}
	})
}

function addUtterancesCommentThread(footer) {
	let commentTitle = document.createElement("h3");
	commentTitle.innerText = "Page Comments";
	let commentFooter = document.createElement("p");
	commentFooter.classList.add("small");
	commentFooter.innerText = "Comments for this chapter. You will need a GitHub account. Please follow all terms and conditions of GitHub issues and maintain etiquette in the comments. Cookies are required for this functionality."

	let utterances = document.createElement("script");
	utterances.src = "https://utteranc.es/client.js";
	utterances.setAttribute("repo", "yanwenywan/website");
	utterances.setAttribute("issue-term", "pathname");
	utterances.setAttribute("label", "comment thread");
	utterances.setAttribute("theme","github-light");
	utterances.crossOrigin = "anonymous"
	utterances.async = true;

	footer.appendChild(commentTitle);
	footer.appendChild(commentFooter);
	footer.appendChild(utterances);
	
}

function makefootnotes() {
	// Credit to Fear for the footnotes code
	let footNoteMap = {};

	let footNoteMarks = document.querySelectorAll("sup");

	let footNote = document.querySelector("body>div#double>p:last-child");

	let content = footNote.innerHTML.trim();  // there was a todo here but I'm not doing anything to it
	let patt = /【(\d+)】([^【]+)/g;
	let match;
	let footNoteDescCount = 0;
	while (match = patt.exec(content)) {
		footNoteDescCount++;
		footNoteMap[match[1]] = match[2].trim()
	}

	if (footNoteMarks.length && footNoteDescCount) {
		footNoteMarks.forEach(function (footnoteMark) {
			let footNoteDisplayNumber = footnoteMark.textContent
			let footNoteNumber = footNoteDisplayNumber.substring(1, footNoteDisplayNumber.length - 1);

			let anchor = document.createElement('a');
			anchor.textContent = footNoteDisplayNumber;
			
			footnoteMark.textContent = undefined;
			footnoteMark.appendChild(anchor);
			footnoteMark.style.cursor = 'pointer';
			anchor.onclick = function (_) {
				let backdrop = makeBackdrop();

				let body = document.querySelector('body');
				body.appendChild(backdrop);

				let footNoteContent = makeFootnoteContentBox();
				let footNoteText = document.createElement('p');
				footNoteText.innerHTML = footNoteMap[footNoteNumber];
				footNoteContent.appendChild(footNoteText);

				let closeButtonGroup = document.createElement('div');
				footNoteContent.appendChild(closeButtonGroup);
				closeButtonGroup.classList.add('threecol');

				// Add dummy elems for alignment
				let leftDummy = document.createElement('p');
				leftDummy.classList.add('left');
				closeButtonGroup.appendChild(leftDummy);

				let centerDummy = document.createElement('p');
				centerDummy.classList.add('center');
				closeButtonGroup.appendChild(centerDummy);

				let closeButtonRight = document.createElement('p');
				closeButtonRight.classList.add('right');
				closeButtonGroup.appendChild(closeButtonRight);

				let closeButton = document.createElement('a');
				closeButton.style.cursor = 'pointer';
				closeButton.textContent = 'Close';
				closeButtonRight.appendChild(closeButton);
				closeButton.onclick = function () {
					backdrop.remove()
				}

				backdrop.appendChild(footNoteContent);
				backdrop.onclick = function (e) {
					if (backdrop === e.target) {
						backdrop.remove();
					}
				}

			}
		});
	}
}

function makeBackdrop() {
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

	backdrop.style.background = 'rgba(0, 0, 0, 0.7)';
	return backdrop;
}

function makeFootnoteContentBox() {
	var footNoteContent = document.createElement('div');
	footNoteContent.classList.add('double')
	footNoteContent.classList.add("thin")
	footNoteContent.style.paddingBottom = '0';
	return footNoteContent;
}

