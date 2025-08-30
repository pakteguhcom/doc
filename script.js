document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================
    // 1. MANAJEMEN STATE DAN SELEKSI DOM
    // =================================================

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

    // =================================================
    // 2. FUNGSI UTAMA (RENDER DAN LOGIKA)
    // =================================================

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
                    .then(result => {
                        viewer.innerHTML = result.value;
                    })
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
    
    // =================================================
    // 3. EVENT LISTENERS
    // =================================================

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
    
    // =======================================================
    // FUNGSI EKSPOR PDF - BAGIAN PALING PENTING
    // =======================================================
    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        
        const pdf = new jsPDF({
            orientation: appState.orientation,
            unit: 'pt',
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });

        // Menggunakan metode .html() yang lebih akurat
        pdf.html(viewer, {
            callback: function (pdf) {
                pdf.save('document.pdf');
            },
            margin: [40, 40, 40, 40], // Atas, Kanan, Bawah, Kiri
            autoPaging: 'text',
            // Lebar area konten di A4 (lebar total - margin kiri & kanan)
            width: 595 - 80, 
            windowWidth: viewer.scrollWidth,
        });
    });
    
    exportImgBtn.addEventListener('click', () => {
        html2canvas(viewer, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'document.png';
            link.click();
        });
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    // =================================================
    // 4. INISIALISASI
    // =================================================

    updateUI();
});
