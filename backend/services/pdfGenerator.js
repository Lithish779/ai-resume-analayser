const PDFDocument = require("pdfkit");

/**
 * Generates a PDF resume buffer based on format
 */
async function generatePdf(resumeData, format = "classic") {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (format === "sidebar") {
      buildSidebarPdf(doc, resumeData);
    } else if (format === "modern") {
      buildModernPdf(doc, resumeData);
    } else if (format === "elegant") {
      buildElegantPdf(doc, resumeData);
    } else if (format === "professional") {
      buildProfessionalPdf(doc, resumeData);
    } else {
      buildClassicPdf(doc, resumeData);
    }

    doc.end();
  });
}

// ─── Shared Helpers ───────────────────────────────────────────────
function drawLine(doc, y) {
  doc.strokeColor("#bdc3c7").lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke();
}

function addSectionTitle(doc, title, y, color = "#1a1a2e") {
  doc.fillColor(color).font("Helvetica-Bold").fontSize(12).text(title.toUpperCase(), 50, y);
  drawLine(doc, y + 15);
  return y + 30;
}

// ─── Classic PDF ──────────────────────────────────────────────────
function buildClassicPdf(doc, data) {
  let y = 50;

  // Header
  doc.fillColor("#1a1a2e").font("Helvetica-Bold").fontSize(24).text(data.name || "Your Name", { align: "center" });
  y = doc.y + 5;
  doc.fillColor("#555555").font("Helvetica").fontSize(12).text(data.title || "", { align: "center" });
  y = doc.y + 5;
  const contact = [data.email, data.phone, data.location].filter(Boolean).join("  |  ");
  doc.fillColor("#777777").font("Helvetica").fontSize(10).text(contact, { align: "center" });
  y = doc.y + 30;

  // Summary
  if (data.summary) {
    y = addSectionTitle(doc, "Professional Summary", y);
    doc.fillColor("#333").font("Helvetica").fontSize(10).text(data.summary, 50, y, { lineGap: 4 });
    y = doc.y + 20;
  }

  // Experience
  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    y = addSectionTitle(doc, "Experience", y);
    experiences.forEach((exp) => {
      doc.fillColor("#111").font("Helvetica-Bold").fontSize(11).text(exp.role || "", 50, y);
      const companyWidth = doc.widthOfString(exp.role || "") + 10;
      doc.fillColor("#555").font("Helvetica").fontSize(11).text(`  —  ${exp.company || ""}`, 50 + companyWidth, y);
      y = doc.y + 2;
      doc.fillColor("#888").font("Helvetica-Oblique").fontSize(9).text(exp.duration || "", 50, y);
      y = doc.y + 10;
      (exp.bullets || []).forEach((bullet) => {
        doc.fillColor("#333").font("Helvetica").fontSize(10).text(`• ${bullet}`, 60, y, { width: 485, lineGap: 2 });
        y = doc.y + 4;
      });
      y += 10;
    });
  }

  // Skills
  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (skills.length) {
    y = addSectionTitle(doc, "Skills", y);
    doc.fillColor("#333").font("Helvetica").fontSize(10).text(skills.join("  •  "), 50, y);
  }
}

// ─── Sidebar PDF (Simplified) ─────────────────────────────────────
function buildSidebarPdf(doc, data) {
  // Draw Sidebar BG
  doc.rect(0, 0, 180, 842).fill("#1a1a2e");

  // Sidebar Content
  let sy = 50;
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text(data.name || "", 20, sy, { width: 140 });
  sy = doc.y + 10;
  doc.fillColor("#c8f064").font("Helvetica").fontSize(10).text(data.title || "", 20, sy, { width: 140 });
  sy = doc.y + 30;

  const addSideSection = (title, items) => {
    doc.fillColor("#c8f064").font("Helvetica-Bold").fontSize(9).text(title.toUpperCase(), 20, sy);
    sy = doc.y + 5;
    items.forEach(item => {
      doc.fillColor("#dddddd").font("Helvetica").fontSize(8).text(item, 20, sy, { width: 140 });
      sy = doc.y + 4;
    });
    sy += 15;
  };

  const contact = [data.email, data.phone, data.location].filter(Boolean);
  if (contact.length) addSideSection("Contact", contact);
  
  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (skills.length) addSideSection("Skills", skills);
  
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  if (certifications.length) addSideSection("Certifications", certifications);

  // Main Content
  let my = 50;
  const mx = 200;
  const mw = 345;

  if (data.summary) {
    doc.fillColor("#1a1a2e").font("Helvetica-Bold").fontSize(12).text("PROFILE", mx, my);
    my = doc.y + 5;
    doc.strokeColor("#c8f064").lineWidth(2).moveTo(mx, my).lineTo(mx + 30, my).stroke();
    my += 10;
    doc.fillColor("#333").font("Helvetica").fontSize(10).text(data.summary, mx, my, { width: mw, lineGap: 3 });
    my = doc.y + 25;
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    doc.fillColor("#1a1a2e").font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", mx, my);
    my = doc.y + 10;
    experiences.forEach(exp => {
      doc.fillColor("#000").font("Helvetica-Bold").fontSize(11).text(exp.role || "", mx, my);
      my = doc.y + 2;
      doc.fillColor("#666").font("Helvetica").fontSize(10).text(exp.company || "", mx, my);
      doc.fillColor("#999").font("Helvetica-Oblique").fontSize(9).text(exp.duration || "", mx + mw - 100, my, { align: 'right', width: 100 });
      my = doc.y + 8;
      (exp.bullets || []).forEach(b => {
        doc.fillColor("#333").font("Helvetica").fontSize(9).text(`• ${b}`, mx + 5, my, { width: mw - 10, lineGap: 2 });
        my = doc.y + 3;
      });
      my += 10;
    });
  }
}

// ─── Elegant PDF ──────────────────────────────────────────────────
function buildElegantPdf(doc, data) {
  let y = 50;
  doc.fillColor("#2c3e50").font("Helvetica-Bold").fontSize(22).text(data.name || "", { align: "center" });
  y = doc.y + 5;
  doc.fillColor("#7f8c8d").font("Times-Italic").fontSize(12).text(data.title || "", { align: "center" });
  y = doc.y + 10;
  const contact = [data.email, data.phone, data.location].filter(Boolean).join("  •  ");
  doc.fillColor("#95a5a6").font("Helvetica").fontSize(9).text(contact, { align: "center" });
  y = doc.y + 30;

  const elegantSection = (title, curY) => {
    doc.fillColor("#2c3e50").font("Helvetica-Bold").fontSize(11).text(title.toUpperCase(), 50, curY, { align: "center" });
    const lineY = doc.y + 5;
    doc.strokeColor("#bdc3c7").lineWidth(0.5).moveTo(200, lineY).lineTo(395, lineY).stroke();
    return lineY + 15;
  };

  if (data.summary) {
    y = elegantSection("Profile", y);
    doc.fillColor("#333").font("Times-Roman").fontSize(10).text(data.summary, 80, y, { align: "center", width: 435, lineGap: 3 });
    y = doc.y + 25;
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    y = elegantSection("Experience", y);
    experiences.forEach(exp => {
      doc.fillColor("#2c3e50").font("Helvetica-Bold").fontSize(10).text(exp.role || "", 50, y);
      doc.fillColor("#7f8c8d").font("Helvetica").fontSize(10).text(`  |  ${exp.company || ""}`, 50 + (doc.widthOfString(exp.role || "")) + 5, y);
      y = doc.y + 2;
      doc.fillColor("#95a5a6").font("Times-Italic").fontSize(9).text(exp.duration || "", 50, y);
      y = doc.y + 8;
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      bullets.forEach(b => {
        doc.fillColor("#444").font("Times-Roman").fontSize(10).text(`• ${b}`, 70, y, { width: 450, lineGap: 2 });
        y = doc.y + 3;
      });
      y += 12;
    });
  }
}

// ─── Professional PDF ─────────────────────────────────────────────
function buildProfessionalPdf(doc, data) {
  let y = 50;
  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(20).text(data.name?.toUpperCase() || "");
  y = doc.y + 5;
  const contact = [data.email, data.phone, data.location].filter(Boolean).join("  |  ");
  doc.fillColor("#444444").font("Helvetica").fontSize(10).text(contact);
  y = doc.y + 20;

  const profSection = (title, curY) => {
    doc.rect(50, curY, 495, 18).fill("#f4f4f4");
    doc.fillColor("#333").font("Helvetica-Bold").fontSize(10).text(title.toUpperCase(), 55, curY + 4);
    return curY + 25;
  };

  if (data.summary) {
    y = profSection("Executive Summary", y);
    doc.fillColor("#222").font("Helvetica").fontSize(10).text(data.summary, 50, y, { lineGap: 3 });
    y = doc.y + 15;
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    y = profSection("Professional Experience", y);
    experiences.forEach(exp => {
      doc.fillColor("#000").font("Helvetica-Bold").fontSize(10).text(exp.company || "", 50, y);
      doc.fillColor("#666").font("Helvetica").fontSize(9).text(exp.duration || "", 400, y, { align: "right", width: 145 });
      y = doc.y + 2;
      doc.fillColor("#333").font("Helvetica-Oblique").fontSize(10).text(exp.role || "", 50, y);
      y = doc.y + 8;
      (exp.bullets || []).forEach(b => {
        doc.fillColor("#333").font("Helvetica").fontSize(9).text(`• ${b}`, 65, y, { width: 480, lineGap: 2 });
        y = doc.y + 2;
      });
      y += 8;
    });
  }
}

// ─── Modern PDF (Dark Header) ─────────────────────────────────────
function buildModernPdf(doc, data) {
  // Top Banner
  doc.rect(0, 0, 595, 120).fill("#0e0e1a");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(26).text(data.name || "", 50, 40);
  doc.fillColor("#c8f064").font("Helvetica").fontSize(12).text(data.title || "", 50, 75);
  doc.fillColor("#bbbbbb").font("Helvetica").fontSize(9).text([data.email, data.phone, data.location].filter(Boolean).join("   •   "), 50, 95);

  let y = 140;

  const modernSection = (title, curY) => {
    doc.fillColor("#1a1a2e").font("Helvetica-Bold").fontSize(13).text(title, 50, curY);
    const lineY = doc.y + 4;
    doc.strokeColor("#c8f064").lineWidth(2).moveTo(50, lineY).lineTo(100, lineY).stroke();
    return lineY + 15;
  };

  if (data.summary) {
    y = modernSection("Profile", y);
    doc.fillColor("#333").font("Helvetica").fontSize(10).text(data.summary, 50, y, { lineGap: 3 });
    y = doc.y + 25;
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    y = modernSection("Experience", y);
    experiences.forEach(exp => {
      doc.fillColor("#000").font("Helvetica-Bold").fontSize(11).text(exp.role || "", 50, y);
      doc.fillColor("#666").font("Helvetica").fontSize(10).text(` at ${exp.company || ""}`, 50 + (doc.widthOfString(exp.role || "")) + 2, y);
      y = doc.y + 2;
      doc.fillColor("#999").font("Helvetica-Oblique").fontSize(9).text(exp.duration || "", 50, y);
      y = doc.y + 10;
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      bullets.forEach(b => {
        doc.fillColor("#333").font("Helvetica").fontSize(9).text(`▸ ${b}`, 60, y, { width: 485, lineGap: 2 });
        y = doc.y + 3;
      });
      y += 12;
    });
  }
}

module.exports = { generatePdf };
