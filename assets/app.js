const fileInput = document.getElementById("fileInput");
const urlInput = document.getElementById("urlInput");
const loadUrlBtn = document.getElementById("loadUrlBtn");
const dropZone = document.getElementById("dropZone");
const preview = document.getElementById("preview");
const statusBar = document.getElementById("status");

// Tabs
const previewTab = document.getElementById("previewTab");
const editTab = document.getElementById("editTab");
const previewContent = document.getElementById("preview");
const editorContent = document.getElementById("editor");

previewTab.addEventListener("click", () => {
  previewTab.classList.add("active");
  editTab.classList.remove("active");
  previewContent.classList.add("active");
  editorContent.classList.remove("active");
});

editTab.addEventListener("click", () => {
  editTab.classList.add("active");
  previewTab.classList.remove("active");
  editorContent.classList.add("active");
  previewContent.classList.remove("active");
});

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});
window.addEventListener("load", () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") document.body.classList.add("dark");
});

// Open file (local)
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) loadDocx(file);
});

// DnD
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("hover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("hover"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("hover");
  const file = e.dataTransfer.files[0];
  if (file) loadDocx(file);
});

// From URL (needs CORS allowed)
loadUrlBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const blob = await res.blob();
    loadDocx(blob);
  } catch (err) {
    console.error(err);
    alert("Gagal memuat dari URL (CORS mungkin memblokir).");
  }
});

// Load DOCX → HTML (Mammoth with styles)
async function loadDocx(fileOrBlob) {
  statusBar.textContent = "Memproses .docx...";
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const arrayBuffer = event.target.result;
      const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer }, {
        styleMap: [
          "p[style-name='Title'] => h1.title",
          "p[style-name='Subtitle'] => h2.subtitle",
        ]
      });
      const clean = DOMPurify.sanitize(html);
      preview.innerHTML = clean;
      quill.root.innerHTML = clean; // set into editor as HTML
      statusBar.textContent = "Dokumen dimuat.";
      if (messages && messages.length) console.warn("Mammoth messages:", messages);
    } catch (err) {
      console.error(err);
      alert("Gagal mem-parsing DOCX.");
      statusBar.textContent = "Gagal memuat dokumen.";
    }
  };
  reader.readAsArrayBuffer(fileOrBlob);
}
