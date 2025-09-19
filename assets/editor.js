// Init Quill Editor
const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean']
];

const quill = new Quill('#editorContainer', {
  modules: { toolbar: toolbarOptions },
  theme: 'snow'
});

// Optional: keyboard shortcut save (Ctrl/Cmd+S → export docx)
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    document.getElementById("saveDocx").click();
  }
});
