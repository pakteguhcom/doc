// HTML → docx mapping sederhana
// Meng-cover: paragraf, heading (h1-h3), bold/italic/underline, link (sebagai teks),
// list bullet/numbering, tabel (sederhana), gambar base64.

const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType,
        Table, TableRow, TableCell, WidthType, Media, Numbering } = window.docx || {};

function ensureDocx() {
  if (!window.docx) {
    alert("Library docx belum termuat. Periksa koneksi/CDN dan muat ulang halaman.");
    throw new Error("docx not loaded");
  }
}

// Helper: parse inline nodes → array<TextRun|...>
function inlineRunsFromNode(node) {
  ensureDocx();
  const runs = [];
  function walk(n, inherited = { bold: false, ital: false, underline: false }) {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.nodeValue;
      if ((text && text.trim() !== "") || (text && /\S/.test(text))) {
        runs.push(new TextRun({
          text,
          bold: inherited.bold,
          italics: inherited.ital,
          underline: inherited.underline ? {} : undefined,
        }));
      }
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;

    const tag = n.tagName.toLowerCase();
    const next = { ...inherited };
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.ital = true;
    if (tag === "u") next.underline = true;

    if (tag === "img") {
      return; // inline img dihandle di block
    }

    Array.from(n.childNodes).forEach(child => walk(child, next));
  }
  walk(node);
  return runs;
}

// Numbering config untuk list
function buildNumbering() {
  ensureDocx();
  return new Numbering({
    config: [
      {
        reference: "bulletList",
        levels: [
          { level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT },
          { level: 1, format: "bullet", text: "◦", alignment: AlignmentType.LEFT },
          { level: 2, format: "bullet", text: "▪", alignment: AlignmentType.LEFT },
        ],
      },
      {
        reference: "numberList",
        levels: [
          { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT },
          { level: 1, format: "lowerLetter", text: "%2.", alignment: AlignmentType.LEFT },
          { level: 2, format: "lowerRoman", text: "%3.", alignment: AlignmentType.LEFT },
        ],
      },
    ],
  });
}

// Konversi satu node block
function blockFromNode(n, context) {
  ensureDocx();
  const tag = n.tagName?.toLowerCase?.();
  if (!tag) return null;

  if (tag === "h1" || tag === "h2" || tag === "h3") {
    const level = tag === "h1" ? HeadingLevel.HEADING_1 :
                  tag === "h2" ? HeadingLevel.HEADING_2 :
                                  HeadingLevel.HEADING_3;
    return new Paragraph({
      heading: level,
      children: inlineRunsFromNode(n),
    });
  }

  if (tag === "p" || tag === "div") {
    const imgs = n.querySelectorAll(":scope > img");
    if (imgs.length === 1 && n.childNodes.length === 1) {
      const img = imgs[0];
      const media = imageFromImg(img, context);
      if (media) return new Paragraph({ children: [media] });
    }
    return new Paragraph({ children: inlineRunsFromNode(n) });
  }

  if (tag === "ul" || tag === "ol") {
    const isBullet = tag === "ul";
    const paras = [];
    const liNodes = Array.from(n.children).filter(el => el.tagName?.toLowerCase() === "li");
    liNodes.forEach((li) => {
      let level = 0;
      let parent = li.parentElement;
      while (parent && (parent.tagName?.toLowerCase?.() === "ul" || parent.tagName?.toLowerCase?.() === "ol")) {
        parent = parent.parentElement?.closest("ul,ol");
        if (parent) level++;
      }
      if (level > 2) level = 2;

      const p = new Paragraph({
        children: inlineRunsFromNode(li),
        numbering: {
          reference: isBullet ? "bulletList" : "numberList",
          level,
        },
      });
      paras.push(p);

      const subLists = li.querySelectorAll(":scope > ul, :scope > ol");
      subLists.forEach((sub) => {
        const subBlocks = blockFromNode(sub, context);
        if (Array.isArray(subBlocks)) paras.push(...subBlocks);
      });
    });
    return paras;
  }

  if (tag === "table") {
    const rows = [];
    const rowEls = Array.from(n.querySelectorAll(":scope > tbody > tr, :scope > tr"));
    rowEls.forEach((tr) => {
      const cells = [];
      const cellEls = Array.from(tr.children).filter(el => ["td","th"].includes(el.tagName.toLowerCase()));
      cellEls.forEach((td) => {
        const paras = [];
        if (td.innerHTML.trim() === "") {
          paras.push(new Paragraph({ children: [] }));
        } else {
          const blocks = blocksFromContainer(td, context);
          (Array.isArray(blocks) ? blocks : [blocks]).forEach(b => {
            if (!b) return;
            if (Array.isArray(b)) b.forEach(x => paras.push(x));
            else paras.push(b);
          });
        }
        cells.push(new TableCell({ children: paras.length ? paras : [new Paragraph("")] }));
      });
      rows.push(new TableRow({ children: cells }));
    });

    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  }

  if (tag === "img") {
    const media = imageFromImg(n, context);
    if (media) return new Paragraph({ children: [media] });
    return new Paragraph({ children: [new TextRun(" (gambar tidak valid) ")] });
  }

  return null;
}

function blocksFromContainer(container, context) {
  ensureDocx();
  const out = [];
  Array.from(container.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const block = blockFromNode(node, context);
      if (!block) return;
      if (Array.isArray(block)) out.push(...block);
      else out.push(block);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue.trim();
      if (text) out.push(new Paragraph({ children: [new TextRun(text)] }));
    }
  });
  return out;
}

function imageFromImg(imgEl, context) {
  ensureDocx();
  const src = imgEl.getAttribute("src");
  if (!src || !src.startsWith("data:image/")) return null;
  try {
    const { data, width, height } = dataURLToUint8Array(src, imgEl);
    return Media.addImage(context.doc, data, width, height);
  } catch (e) {
    console.warn("Gagal parse gambar:", e);
    return null;
  }
}

function dataURLToUint8Array(dataURL, imgEl) {
  const [meta, base64] = dataURL.split(",");
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  const width = imgEl.naturalWidth || imgEl.width || 400;
  const height = imgEl.naturalHeight || imgEl.height || 300;
  return { data: bytes, width, height };
}

// ====== Export handlers ======

document.getElementById("saveHtml").addEventListener("click", () => {
  const html = quill.root.innerHTML;
  const clean = DOMPurify.sanitize(html);
  downloadFile("document.html", clean, "text/html");
});

document.getElementById("savePdf").addEventListener("click", () => {
  const element = document.getElementById("editorContainer");
  html2pdf().from(element).save("document.pdf");
});

document.getElementById("saveDocx").addEventListener("click", async () => {
  try {
    ensureDocx();
    const html = DOMPurify.sanitize(quill.root.innerHTML);
    const container = document.createElement("div");
    container.innerHTML = html;

    const numbering = buildNumbering();
    const doc = new Document({ numbering });
    const context = { doc };
    const children = blocksFromContainer(container, context);

    const finalDoc = new Document({
      numbering,
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(finalDoc);
    downloadFile("document.docx", blob);
    setStatus("Export DOCX berhasil.");
  } catch (err) {
    console.error(err);
    alert("Export DOCX gagal. Lihat console untuk detail.");
    setStatus("Export DOCX gagal.");
  }
});

function downloadFile(filename, data, type) {
  let blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setStatus(msg) {
  const s = document.getElementById("status");
  s.textContent = msg;
}
