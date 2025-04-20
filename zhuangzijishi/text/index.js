const ChapterType = {
    PREFACE: "PREFACE",
    BODY: "BODY"
};


class ContentData {
    #currentSection = 0;
    #chapterName = "";
    #chapterType = ChapterType.BODY;
    #paragraphs = [];
    #maxParagraphs = 999;
    #sectionChangeListener = null;
    #chapterNum = null;

    get chapterNum() {
        return this.#chapterNum;
    }

    set chapterNum(value) {
        const num = Number(value);
        if (!isNaN(num) && num >= 1 && num <= 30) {
            this.#chapterNum = num;
        }
    }

    get currentSection() {
        return this.#currentSection;
    }

    set currentSection(value) {
        const num = Number(value);
        const bounded = isNaN(num) ? 0 : Math.max(0, Math.min(this.#maxParagraphs - 1, num));
        if (this.#currentSection !== bounded) {
            this.#currentSection = bounded;
            this.storeProgress();
            if (typeof this.#sectionChangeListener === 'function') {
                this.#sectionChangeListener(bounded);
            }
        }
    }

    storeProgress() {
        if (this.#chapterNum !== null) {
            const key = `yanwenyuan-zhuangzi-${this.#chapterNum}-progress`;
            console.log(`Storing progress ${this.currentSection} to ${key}`);
            
            localStorage.setItem(key, this.#currentSection.toString());
        }
    }

    onSectionChange(listener) {
        if (typeof listener === 'function') {
            this.#sectionChangeListener = listener;
        }
    }

    get chapterName() {
        return this.#chapterName;
    }

    set chapterName(value) {
        this.#chapterName = String(value);
    }

    get chapterType() {
        return this.#chapterType;
    }

    set chapterType(value) {
        if (value === ChapterType.PREFACE || value === ChapterType.BODY) {
            this.#chapterType = value;
        }
    }

    get paragraphs() {
        return this.#paragraphs;
    }

    set paragraphs(value) {
        if (Array.isArray(value)) {
            this.#paragraphs = value;
            this.maxParagraphs = value.length;
        } else {
            this.#paragraphs = [];
            this.maxParagraphs = 1;
        }
    }

    get maxParagraphs() {
        return this.#maxParagraphs;
    }

    set maxParagraphs(value) {
        const num = Number(value);
        this.#maxParagraphs = isNaN(num) ? 1 : Math.max(1, Math.min(999, num));
    }

    getCurrentParagraph() {
        return this.#paragraphs[this.#currentSection];
    }
}


const data = new ContentData();

let btnPrev, btnBack, btnNext;


function handleSectionChange(newSection) {
    console.log("Section changed to:", newSection);
    populateContents();

    if (btnPrev) {
        btnPrev.classList.toggle('hidden', newSection === 0);
    }
    if (btnNext) {
        btnNext.classList.toggle('hidden', newSection === data.maxParagraphs - 1);
    }
}


data.onSectionChange(handleSectionChange);


document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const chapter = params.get('chapter');

    if (!chapter) {
        const shouldGoBack = confirm("君未言其章數，吾愧不能效，請回再求。");
        if (shouldGoBack) window.location.href = "../";
        return;
    }

    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 30) {
        const shouldGoBack = confirm("君章數差矣，本書止有三十篇，必一至三十也，請回再求。");
        if (shouldGoBack) window.location.href = "../";
        return;
    }

    populateContentData(chapterNum);
    populateButtons();
    // populateContents()
});


function populateContentData(chapterNum) {
    const key = `yanwenyuan-zhuangzi-${chapterNum}-progress`;
    const progress = parseInt(localStorage.getItem(key), 10);
    console.log(`Read ${progress} from ${key}`);
    

    data.chapterNum = chapterNum;
    data.currentSection = isNaN(progress) ? 0 : progress;

    readChapter(chapterNum)
        .then(json => {
            data.chapterName = json.name;
            data.chapterType = json.type;
            data.paragraphs = json.paragraphs;
            console.log(`Populating content for chapter ${chapterNum}, paragraphs: ${json.paragraphs.length}`);
            handleSectionChange(data.currentSection)
        })
        .catch(err => {
            console.error(`Failed to load chapter ${chapterNum}:`, err);
        });
}


function readChapter(chapterNum) {
    return fetch(`../data/${chapterNum}.json`)
        .then(res => res.json());
}


function populateButtons() {
    const container = document.getElementById('floaters');
    if (!container) return;

    container.innerHTML = "";

    const createButton = (label, onClick) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            console.log("off");
            
            btn.disabled = true;
            onClick();
            setTimeout(() => {
                btn.disabled = false;
            }, 100);
        });
        return btn;
    };

    btnPrev = createButton('上句', () => {
        data.currentSection = data.currentSection - 1;
    });

    btnBack = createButton('返回', () => {
        window.location.href = '../';
    });

    btnNext = createButton('下句', () => {
        data.currentSection = data.currentSection + 1;
    });

    container.appendChild(btnPrev);
    container.appendChild(btnBack);
    container.appendChild(btnNext);
}


function populateContents() {
    document.title = `莊子 ${data.chapterName} ${data.currentSection+1}`;

    const mainTextDiv = document.getElementById('maintext');
    const commentaryDiv = document.getElementById('commentary');
    if (!mainTextDiv || !commentaryDiv) return;
    
    const paragraph = data.getCurrentParagraph();
    
    if (!paragraph) {
        console.error(`unable to find paragraph ${data.currentSection} in chapter`)
        return
    };

    mainTextDiv.innerHTML = "";
    commentaryDiv.innerHTML = "";

    const mainP = document.createElement('p');

    const marker = document.createElement('span');
    marker.textContent = `${data.currentSection+1}`;
    marker.style.backgroundColor = 'var(--green)';
    marker.style.color = 'var(--darkyellowish)';
    marker.style.borderRadius = '0.2em';
    marker.style.padding = '0 0.4em';
    marker.style.marginRight = '0.5em';

    mainP.appendChild(marker);
    const textSpan = document.createElement('span');
    textSpan.innerHTML = wrapSuperscriptRefs(paragraph.mainText);
    mainP.appendChild(textSpan);

    mainTextDiv.appendChild(mainP);

    if (paragraph.commentary && paragraph.commentary.length > 0) {
        for (const entry of paragraph.commentary) {
            const p = document.createElement('p');
            // p.innerHTML = wrapSuperscriptRefs(entry.text);
            p.innerHTML = entry.text;
            if (entry.type === "SMALL") {
                p.classList.add('small');
            }
            commentaryDiv.appendChild(p);
        }
    } else {
        const p = document.createElement('p');
        p.textContent = '……此句無注……';
        p.style.color = 'gray';
        commentaryDiv.appendChild(p);
    }

    // append 5em spacer block
    const spacer = document.createElement('div');
    spacer.style.height = '5em';
    commentaryDiv.appendChild(spacer);
}


function wrapSuperscriptRefs(text) {
    return text.replace(/【[一二三四五六七八九〇十百千萬億兆]+】/g, match => `<sup>${match}</sup>`);
}
