function getActivePdfNode() {
  const preview = document.getElementById("preview");
  const editorContainer = document.getElementById("editorContainer");
  if (preview.classList.contains("active")) return preview;            // pakai Preview bila aktif
  const ql = editorContainer.querySelector(".ql-editor");              // atau isi Quill
  return ql || editorContainer;
}

document.getElementById("savePdf").addEventListener("click", () => {
  const source = getActivePdfNode();

  // Clone ke wrapper off-screen agar tidak terkena display:none
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-99999px";
  wrapper.style.top = "0";
  wrapper.style.width = "794px"; // ~A4 @96dpi
  wrapper.style.background = "#ffffff";
  wrapper.style.color = "#000000";
  const clone = source.cloneNode(true);
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const opt = {
    margin: 20,
    filename: "document.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(wrapper).save()
    .then(() => wrapper.remove())
    .catch(err => { console.error(err); wrapper.remove(); alert("Gagal membuat PDF."); });
});
