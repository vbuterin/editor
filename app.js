const sourceEl = document.getElementById('source');
const outputEl = document.getElementById('output');
const saveSourceBtn = document.getElementById('save-source');
const saveOutputBtn = document.getElementById('save-output');

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
  const blob = new Blob([outputEl.innerHTML], { type: 'text/html' });
  saveAs(blob, 'output.html');
});

function updateOutput () {
  try {
      outputEl.innerHTML = marked.parse(sourceEl.value);
  } catch (error) {
    outputEl.innerHTML = '<div style="color:red">Error parsing Markdown</div>';
  }
}

// Add event listener for showing compiled HTML in output div
sourceEl.addEventListener('input', updateOutput);

// Show an alert message when closing the window
window.onbeforeunload = function (event) {
    event.preventDefault();
    event.returnValue = '';
 };
