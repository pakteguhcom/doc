// Tunggu hingga seluruh halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================
    // 1. MANAJEMEN STATE DAN SELEKSI DOM
    // =================================================

    // Objek untuk menyimpan state aplikasi
    const appState = {
        orientation: 'portrait', // 'portrait' atau 'landscape'
        zoomLevel: 1.0, // 1.0 = 100%
    };

    // Seleksi semua elemen interaktif dari DOM
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

    /**
     * Fungsi ini membaca appState dan memperbarui DOM.
     * Dipanggil setiap kali ada perubahan state.
     */
    function updateUI() {
        // 1. Update Orientasi
        viewer.classList.remove('portrait', 'landscape');
        viewer.classList.add(appState.orientation);

        // 2. Update Zoom
        viewer.style.transform = `scale(${appState.zoomLevel})`;
    }

    /**
     * Menangani file yang di-upload pengguna.
     * @param {Event} event 
     */
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        // Jika file adalah .docx
        if (file.name.endsWith('.docx')) {
            reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        viewer.innerHTML = result.value;
                    })
                    .catch(err => console.error("Error processing .docx file:", err));
            };
            reader.readAsArrayBuffer(file);
        } 
        // Jika file adalah .txt
        else if (file.name.endsWith('.txt')) {
            reader.onload = function(e) {
                // Tampilkan teks dengan mempertahankan baris baru
                const text = e.target.result;
                viewer.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
            };
            reader.readAsText(file);
        }
    }
    
    /**
     * Fungsi untuk menerapkan format teks sederhana
     * @param {string} command - Perintah seperti 'bold', 'italic'
     */
    function formatText(command, value = null) {
        document.execCommand(command, false, value);
    }
    

    // =================================================
    // 3. EVENT LISTENERS
    // =================================================

    // Listener untuk upload file
    fileUpload.addEventListener('change', handleFileUpload);

    // Listener untuk tombol orientasi
    orientationBtn.addEventListener('click', () => {
        // Ubah state
        appState.orientation = appState.orientation === 'portrait' ? 'landscape' : 'portrait';
        // Panggil render
        updateUI();
    });

    // Listeners untuk Zoom
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

    // Listeners untuk Toolbar Editor
    document.getElementById('bold-btn').addEventListener('click', () => formatText('bold'));
    document.getElementById('italic-btn').addEventListener('click', () => formatText('italic'));
    document.getElementById('underline-btn').addEventListener('click', () => formatText('underline'));
    document.getElementById('ul-btn').addEventListener('click', () => formatText('insertUnorderedList'));
    document.getElementById('ol-btn').addEventListener('click', () => formatText('insertOrderedList'));
    document.getElementById('align-left-btn').addEventListener('click', () => formatText('justifyLeft'));
    document.getElementById('align-center-btn').addEventListener('click', () => formatText('justifyCenter'));
    document.getElementById('align-right-btn').addEventListener('click', () => formatText('justifyRight'));
    
    // Listener untuk Ekspor ke PDF
    exportPdfBtn.addEventListener('click', () => {
        // Menggunakan library jsPDF dan html2canvas
        const { jsPDF } = window.jspdf;
        
        // Atur orientasi PDF sesuai state
        const pdf = new jsPDF({
            orientation: appState.orientation,
            unit: 'pt', // Menggunakan points agar lebih presisi
            format: 'a4'
        });
        
        // Gunakan html2canvas untuk 'menggambar' div viewer ke canvas
        html2canvas(viewer, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("document.pdf");
        });
    });
    
    // Listener untuk Ekspor ke Gambar
    exportImgBtn.addEventListener('click', () => {
        html2canvas(viewer, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'document.png';
            link.click();
        });
    });

    // Listener untuk Cetak
    printBtn.addEventListener('click', () => {
        window.print();
    });
    
    // =================================================
    // 4. INISIALISASI
    // =================================================

    // Panggil updateUI saat aplikasi pertama kali dimuat
    updateUI();
});
