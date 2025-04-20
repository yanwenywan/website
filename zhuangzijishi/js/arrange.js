
var showdownScript = document.createElement('script');  
showdownScript.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/showdown/2.1.0/showdown.min.js');
showdownScript.onload = main 
document.head.appendChild(showdownScript);

const footerText = `莊子集釋燕文院排`


function preprocess(a) {
	a = a.replace(/\[\^(\d+)\](?!:)/g, "<sup>[$1]<\/sup>"); //"&#91;");      // [
	a = a.replace(/\[\^(\d+)\]:/g, "【$1】 "); //"&#93;");      // ]
	return a
};

function main() {

	let ops =  showdown.getOptions()
	console.log(ops);

	let converter = new showdown.Converter()
	
	let elems = document.getElementsByClassName("md")
	
	Array.from(elems).forEach(elem => {
		elem.textContent = preprocess(elem.textContent);
		let converted = converter.makeHtml(elem.textContent)
		elem.innerHTML = converted;
		// elem.innerHTML = smarten(elem.innerHTML);
	});
	
	let footer = document.getElementById("footer")
	
	footer.innerHTML = ""
	
	let p = document.createElement("p")
	p.className = "small"
	p.innerHTML = footerText
	
	let show = true
	
	if (show) {
		footer.appendChild(p)
	}
}





