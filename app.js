const sourceEl = document.getElementById('source');
const outputEl = document.getElementById('output');
const saveSourceBtn = document.getElementById('save-source');
const saveOutputBtn = document.getElementById('save-output');

let prevContents = [];

// Add the 'download' attribute to buttons for IE10+ support
const isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (isIE && navigator.msSaveOrOpenBlob) {
  saveSourceBtn.setAttribute('download', 'source.md');
  saveOutputBtn.setAttribute('download', 'output.html');
} else {
  // Add a polyfill for saving files in browsers that don't support the 'download' attribute
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);

  function saveAs(blob, filename) {
    if (isIE && navigator.msSaveOrOpenBlob) {
      return navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  }
}

// Add event listeners for saving files
saveSourceBtn.addEventListener('click', () => {
  const textToSave = sourceEl.innerText;
  const lines = textToSave.split('\n');
  const title = lines[0].replace(/^#+\s*/, '').replace(/[^\w]/gi, '_'); // remove # and special chars
  const filename = `${title.trim().toLowerCase()}.md`;
  const blob = new Blob([textToSave], { type: 'text/markdown' });
  saveAs(blob, filename);
});

saveOutputBtn.addEventListener('click', () => {
  const lines = sourceEl.innerText.split('\n');
  const title = lines[0].replace(/^#+\s*/, '').replace(/[^\w]/gi, '_'); // remove # and special chars
  const filename = `${title.trim().toLowerCase()}.html`;
  const blob = new Blob([outputEl.innerHTML], { type: 'text/html' });
  saveAs(blob, filename);
});

function colorTextfield() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    const startMagicString = '[[S`TART]]';
    const endMagicString = '[[E`ND]]';

    range.insertNode(document.createTextNode(endMagicString));
    range.collapse(true);
    range.insertNode(document.createTextNode(startMagicString));

    const content = sourceEl.innerText; // use innerText instead of innerHTML
    const highlightedContent = content
        .replace(/&/g, '&amp;') // Escape HTML special characters
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g, '<span class="blue">[$1]($2)</span>')
        .replace(/^(##* .+)/gm, '<span class="red">$1</span>')
        .replace(/(\*\*.+\*\*)/gm, '<b>$1</b>')
        .replace(/(\_.+\_)/gm, '<i>$1</i>');

    sourceEl.innerHTML = highlightedContent;

    const startPos = sourceEl.innerText.indexOf(startMagicString);
    const endPos = sourceEl.innerText.indexOf(endMagicString) - startMagicString.length;
    sourceEl.innerHTML = sourceEl.innerHTML.replace(startMagicString, '').replace(endMagicString, '');

    if (startPos !== -1 && endPos !== -1) {
        const newRange = document.createRange();
        const walker = document.createTreeWalker(sourceEl, NodeFilter.SHOW_TEXT, null, false);

        let node;
        let charCount = 0;
        let startNode, startOffset, endNode, endOffset;

        // Find start node and offset
        while (node = walker.nextNode()) {
            if (charCount + node.length >= startPos) {
                startNode = node;
                startOffset = startPos - charCount;
                break;
            }
            charCount += node.length;
        }

        charCount = 0;
        walker.currentNode = sourceEl;

        // Find end node and offset
        while (node = walker.nextNode()) {
            if (charCount + node.length >= endPos) {
                endNode = node;
                endOffset = endPos - charCount;
                break;
            }
            charCount += node.length;
        }

        if (startNode && endNode) {
            newRange.setStart(startNode, startOffset);
            newRange.setEnd(endNode, endOffset);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
}

function updateOutput () {
  try {
      prevContents.push(sourceEl.innerText);
      colorTextfield();
      outputEl.innerHTML = marked.parse(sourceEl.innerText);
  } catch (error) {
    outputEl.innerHTML = '<div style="color:red">Error parsing Markdown</div>';
  }
}

// Add event listener for showing compiled HTML in output div
sourceEl.addEventListener('input', updateOutput);

sourceEl.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'z') {
        event.preventDefault(); // Prevent the default undo behavior
        if (prevContents.length > 1) {
            prevContents.pop()
            sourceEl.innerText = prevContents.pop();
            colorTextfield();
        }
    }
});

// Show an alert message when closing the window
window.onbeforeunload = function (event) {
    event.preventDefault();
    event.returnValue = '';
 };
