document.addEventListener('DOMContentLoaded', () => {
    
    const appState = {
        orientation: 'portrait',
        zoomLevel: 1.0,
    };

    const fileUpload = document.getElementById('file-upload');
    const viewer = document.getElementById('viewer');
    const orientationBtn = document.getElementById('orientation-btn');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportImgBtn = document.getElementById('export-img-btn');
    const printBtn = document.getElementById('print-btn');

    function updateUI() {
        viewer.classList.remove('portrait', 'landscape');
        viewer.classList.add(appState.orientation);
        viewer.style.transform = `scale(${appState.zoomLevel})`;
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        if (file.name.endsWith('.docx')) {
            reader.onload = function(e) {
                mammoth.convertToHtml({ arrayBuffer: e.target.result })
                    .then(result => { viewer.innerHTML = result.value; })
                    .catch(err => console.error("Error processing .docx file:", err));
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.endsWith('.txt')) {
            reader.onload = function(e) {
                const text = e.target.result;
                viewer.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
            };
            reader.readAsText(file);
        }
    }
    
    function formatText(command, value = null) {
        document.execCommand(command, false, value);
    }
    
    fileUpload.addEventListener('change', handleFileUpload);
    orientationBtn.addEventListener('click', () => {
        appState.orientation = appState.orientation === 'portrait' ? 'landscape' : 'portrait';
        updateUI();
    });
    zoomInBtn.addEventListener('click', () => {
        appState.zoomLevel += 0.1;
        updateUI();
    });
    zoomOutBtn.addEventListener('click', () => {
        if (appState.zoomLevel > 0.2) {
             appState.zoomLevel -= 0.1;
             updateUI();
        }
    });

    document.getElementById('bold-btn').addEventListener('click', () => formatText('bold'));
    document.getElementById('italic-btn').addEventListener('click', () => formatText('italic'));
    document.getElementById('underline-btn').addEventListener('click', () => formatText('underline'));
    document.getElementById('ul-btn').addEventListener('click', () => formatText('insertUnorderedList'));
    document.getElementById('ol-btn').addEventListener('click', () => formatText('insertOrderedList'));
    document.getElementById('align-left-btn').addEventListener('click', () => formatText('justifyLeft'));
    document.getElementById('align-center-btn').addEventListener('click', () => formatText('justifyCenter'));
    document.getElementById('align-right-btn').addEventListener('click', () => formatText('justifyRight'));
    
    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const options = {
            quality: 0.98,
            height: viewer.scrollHeight,
            width: viewer.scrollWidth,
            style: {
                'transform': 'scale(1)',
                'margin': '0'
            }
        };

        domtoimage.toPng(viewer, options)
            .then(function (dataUrl) {
                const pdf = new jsPDF({
                    orientation: appState.orientation,
                    unit: 'px',
                    format: 'a4'
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save("document.pdf");
            })
            .catch(function (error) {
                console.error('Gagal mengekspor PDF:', error);
            });
    });
    
    exportImgBtn.addEventListener('click', () => {
        domtoimage.toPng(viewer, { quality: 0.95 })
            .then(function (dataUrl) {
                const link = document.createElement('a');
                link.download = 'document.png';
                link.href = dataUrl;
                link.click();
            });
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    updateUI();
});
