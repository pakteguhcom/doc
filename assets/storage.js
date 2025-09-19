// Auto-save draft every 5s
setInterval(() => {
  const content = quill.root.innerHTML;
  localStorage.setItem("draftDoc", content);
  const s = document.getElementById("status");
  if (s) s.textContent = "Draft saved";
}, 5000);

// Restore
window.addEventListener("load", () => {
  const saved = localStorage.getItem("draftDoc");
  if (saved) {
    quill.root.innerHTML = saved;
    const s = document.getElementById("status");
    if (s) s.textContent = "Draft restored";
  }
});

document.getElementById("clearDraft").addEventListener("click", () => {
  localStorage.removeItem("draftDoc");
  quill.root.innerHTML = "";
  const s = document.getElementById("status");
  if (s) s.textContent = "Draft cleared";
});
