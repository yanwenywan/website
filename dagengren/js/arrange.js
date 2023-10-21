
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


;(function() { "use strict";

var
	/**
	 * The parsed output string, in HTML format.
	 * @type {String}
	 */
	output = "",

	BLOCK = "block",
	INLINE = "inline",

	/**
	 * Used to attach MarkdownToHtml object to `window` in browser
	 * context, or as an AMD module where appropriate.
	 * @type {Object}
	 */
	exports,

	/**
	 * An array of parse rule descriptor objects. Each object has two keys;
	 * pattern (the RegExp to match), and replace (the replacement string or
	 * function to execute).
	 * @type {Array}
	 */
	parseMap = [
		{
			// <h1>
			// A line starting with 1-6 hashes.
			pattern: /(#{1,6})([^\n]+)/g,
			replace: "<h$L1>$2</h$L1>",
			type: BLOCK,
		},
		{
			// <blockquote>
			// A greater-than character preceding any characters.
			// \n (any number of tabs) > (words)
			pattern: /\n(?:\s*(?:&gt;|\>))\W*(.*)/g,
			replace: "<blockquote><p>$1</p></blockquote>",
			type: BLOCK,
		},
        {
			// <hr>
			//
			pattern: /\n(?:\s*?)-{3,}\n/g,
			replace: "<hr />",
			type: BLOCK,
		},
		{
			// <hr class="green">
			// specifically for fantasy
			//
			pattern: /\n(?:\s*?)-{3,}green\n/g,
			replace: "<hr />",
			type: BLOCK,
		},
		{
			// <ul>
			//
			pattern: /\n(?:\s?)*\*\s(.*)/g,
			replace: "<ul>\n\t<li>$1</li>\n</ul>",
			type: BLOCK,
		},
		{
			// <ol>
			//
			pattern: /\n(?:\s?)*[0-9]+\.\s*(.*)/g,
			replace: "<ol>\n\t<li>$1</li>\n</ol>",
			type: BLOCK,
		},
		{
			// <p>
			// Any line surrounded by newlines that doesn't start with
			// an HTML tag, asterisk or numeric value with dot following.
			//
			//update: any line with two trailing newlines
			pattern: /(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})((?:.|\n)+?)\n\s*?\n/g,  // /\n(?!<\/?\w+>|\s?\*|\s?[0-9]+|>|\&gt;|-{5,})([^\n]+)/g,
			replace: "<p>$1</p>",
			type: BLOCK,
		},
		{
			// mathjax \[ \]
			// works over multiple lines
			pattern: /(\$\$)((?:.|\n)*?)\1/g,
			replace: "\\[$2\\]",
			type: INLINE,
		},
		{
			// mathjax \( \)
			// works over multiple lines
			pattern: /(\$)((?:.|\n)*?)\1/g,
			replace: "\\($2\\)",
			type: INLINE,
		},
        
		{
            // [^n] footnotes at bottom
            pattern: /\[\^(\d+)\]:/g,
            replace: "【$1】 ",
            type: INLINE,
        },
        {
            // [^n] footnotes
            pattern: /\[\^(\d+)\]/g,
            replace: "<sup>[$1]<\/sup>",
            type: INLINE,
        },
		{
			// <strong>
			// Two astericks, followed by any
			// characters, followed by the same two starting characters.
			// the asterick must immediately be followed by a non-space character
			pattern: /(\*\*)(\S.*?)\1/g,
			replace: "<strong>$2</strong>",
			type: INLINE,
		},
		{
			// <em>
			// One asterisk, followed by any
			// characters, followed by the starting character.
			// the asterick must immediately be followed by a non-space character
			pattern: /(\*)(\S.*?)\1/g,
			replace: "<em>$2</em>",
			type: INLINE,
		},
		{
			// <a>
			// Not starting with an exclamation mark, square brackets
			// surrounding any characters, followed by parenthesis surrounding
			// any characters.
			pattern: /([^!])\[([^\[]+)\]\(([^\)]+)\)/g,
			replace: "$1<a href=\"$3\">$2</a>",
			type: INLINE,
		},
		{
			// <img>
			// Starting with an exclamation mark, then followed by square
			// brackets surrounding any characters, followed by parenthesis
			// surrounding any characters.
			pattern: /!\[([^\[]+)\]\(([^\)]+)\)/g,
			replace: "<img src=\"$2\" alt=\"$1\" />",
			type: INLINE,
		},
		{
			// <del>
			// Double tilde characters surrounding any characters.
			pattern: /\~\~(.*?)\~\~/g,
			replace: "<del>$1</del>",
			type: INLINE,
		},
		{
			// <code>
			//
			pattern: /`(.*?)`/g,
			replace: "<code>$1</code>",
			type: INLINE,
		},
		
		
        
	],
$$;

/**
 * Self-executing function to handle exporting the parse function for
 * external use.
 */
(function go() {
	// Export AMD module if possible.
	if(typeof module !== "undefined"
	&& typeof module.exports !== "undefined") {
		exports = module.exports;
	}
	// Otherwise check for browser context.
	else if(typeof window !== "undefined") {
		window.MarkdownToHtml = {};
		exports = window.MarkdownToHtml;
	}

	exports.parse = parse;
})();

/**
 * Parses a provided Markdown string into valid HTML.
 *
 * @param  {string} string Markdown input for transformation
 * @return {string}        Transformed HTML output
 */
function parse(string) {
	// Pad with newlines for compatibility.
	output = "\n" + string + "\n";

	parseMap.forEach(function(p) {
		// Replace all matches of provided RegExp pattern with either the
		// replacement string or callback function.
		output = output.replace(p.pattern, function() {
			// console.log(this, arguments);
			return replace.call(this, arguments, p.replace, p.type);
		});
	});

	// Perform any post-processing required.
	output = clean(output);
	// Trim for any spaces or newlines.
	output = output.trim();
	// Tidy up newlines to condense where more than 1 occurs back to back.
	output = output.replace(/[\n]{1,}/g, "\n");
	return output;
}

function replace(matchList, replacement, type) {
	var
		i,
	$$;

	for(i in matchList) {
		if(!matchList.hasOwnProperty(i)) {
			continue;
		}

		// Replace $n with the matching regexp group.
		replacement = replacement.split("$" + i).join(matchList[i]);
		// Replace $Ln with the matching regexp group's string length.
		replacement = replacement.split("$L" + i).join(matchList[i].length);
	}

	if(type === BLOCK) {
		replacement = replacement.trim() + "\n";
	}

	return replacement;
}

function clean(string) {
	var cleaningRuleArray = [
		{
			match: /<\/([uo]l)>\s*<\1>/g,
			replacement: "",
		},
		{
			match: /(<\/\w+>)<\/(blockquote)>\s*<\2>/g,
			replacement: "$1",
		},
	];

	cleaningRuleArray.forEach(function(rule) {
		string = string.replace(rule.match, rule.replacement);
	});

	return string;
}

})();


/*
MIT License

Copyright (c) 2019 Greg Bowler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

The bottom part is edited slightly
*/


// get current file name
let url = window.location.pathname;
let currentFile = url.substring(url.lastIndexOf("/")+1);
let currentFileNumber = parseInt(currentFile.split(".")[0]);
// alert(currentFileNumber)

let elem = document.getElementById("double")
elem.innerHTML = smarten(elem.innerHTML);
elem.innerHTML = MarkdownToHtml.parse(elem.innerHTML);


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
	backLink.innerText = "Back"
	lp.appendChild(backLink)
} 
links.appendChild(lp)

let mp = document.createElement("p")
mp.classList.add("centre")
let homeLink = document.createElement("a")
homeLink.href = "../"
homeLink.innerText = "Home"
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
		nextLink.innerText = "Next"
		rp.appendChild(nextLink)
		links.appendChild(rp)
	}
}
req.send();
// end

footer.appendChild(links)

let p = document.createElement("p")
p.className = "small"
p.innerHTML = `If you want to talk with other readers about Nightwatchers (or other cultivation type books) you can join 
our <a href='https://discord.gg/fVj6Ab9pSM'>cultivation groupreading discord server</a>!
<br><br>
I also have a Kofi, which for legal reasons is definitely for supporting my digital art only (promise!): 
<a href='https://ko-fi.com/yanxin'>ko-fi.com/yanxin</a> ... 
plus I guess server space isn't free, and I don't want to put ads/trackers... ever, so thank you if you do!`

let show = true

if (show) {
    footer.appendChild(p)
}

// ================================================================================================================================
// thanks fear
// (makes footnotes popupable)

(function() {
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
})();



