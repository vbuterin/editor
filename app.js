const sourceEl = document.getElementById('source');
const outputEl = document.getElementById('output');
const saveSourceBtn = document.getElementById('save-source');
const saveOutputBtn = document.getElementById('save-output');
const previousSlide = document.getElementById('previous-slide');
const nextSlide = document.getElementById('next-slide');

const slideModeBtn = document.querySelector('#slide-mode');
const documentModeBtn = document.querySelector('#document-mode');

const slideExtraHeader = `
<style>
            @page {
                size: 841px 595px;
                margin: 0;
            }
            body {
                font-family: Arial, sans-serif;
                font-size: 180%;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }
            .slide {
                width: 100%;
                height: 160mm; /* Explicitly set to match A4 landscape */
                display: table;
                page-break-after: always;
                box-sizing: border-box;
                position: relative;
                overflow: hidden;
            }
</style>
`

let activeIndex = 0;
let currentView = 'document';

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
  const textToSave = sourceEl.value;
  const blob = new Blob([textToSave], { type: 'text/markdown' });
  saveAs(blob, 'source.md');
});

saveOutputBtn.addEventListener('click', () => {
  const htmlToSave = `
<html>
    <head>
    <link rel="stylesheet" href="css/styles.css">
    ${ currentView == 'slide' ? slideExtraHeader : '' }
     </head>
     <body>
   	${ outputEl.innerHTML }
     </body>
</html>
`;
  const blob = new Blob([htmlToSave], { type: 'text/html' });
  saveAs(blob, 'output.html');
});

// Add event listener to radio buttons
slideModeBtn.addEventListener('change', () => {
  currentView = 'slide';
  updateOutput();
  outputEl.classList.remove('markdown-body');
  outputEl.style.height = '560px';
});

documentModeBtn.addEventListener('change', () => {
  currentView = 'document';
  updateOutput();
  outputEl.classList.add('markdown-body');
  outputEl.style.height = 'calc(100vh - 4rem)';
});

function getParameter(source, styleString) {
  const regex = new RegExp(`\\[${styleString}\\]: <> \\(.*\\)`, 'gm');
  const match = source.match(regex);
  if (match)
    return match[0].slice(match[0].indexOf('(')+1, match[0].lastIndexOf(')'));
  else
    return '';
}

function updateOutput () {
  try {
      if (currentView == 'document') {
        outputEl.innerHTML = marked.parse(sourceEl.value);
      }
      else {
        let globalStyle = getParameter(sourceEl.value, 'global_style');
        let sources = sourceEl.value.split('\n---');
        let outputs = sources.map((x) => {
	    let style = getParameter(x, 'slide_style') || globalStyle;
	    return (
                '<div class="slide" style="' + style + '">' +
		marked.parse(x) +
		'</div>'
            )
	});
        outputEl.innerHTML = outputs.join(' ');
      }
  } catch (error) {
    outputEl.innerHTML = '<div style="color:red">Error parsing Markdown</div>';
  }
}

// Add event listener for showing compiled HTML in output div
sourceEl.addEventListener('input', updateOutput);

previousSlide.addEventListener('click', () => {
    if (activeIndex > 0) {
      activeIndex--;
      updateActiveView();
    }
});

nextSlide.addEventListener('click', () => {
    if (activeIndex < getSlideCount() - 1) {
      activeIndex++;
      updateActiveView();
    }
});

function updateActiveView() {
    const slides = output.querySelectorAll('.slide');
    const currentSlide = slides[activeIndex];
    currentSlide.scrollIntoView({ behavior: 'smooth' });
}

function getSlideCount() {
    return output.querySelectorAll('.slide').length;
}
