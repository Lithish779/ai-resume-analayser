const {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  Packer,
} = require("docx");

/**
 * Generates a DOCX resume buffer from structured resume data
 */
async function generateDocx(resumeData, format = "classic") {
  let doc;

  if (format === "sidebar") {
    doc = buildSidebarLayout(resumeData);
  } else if (format === "modern") {
    doc = buildModernLayout(resumeData);
  } else if (format === "elegant") {
    doc = buildElegantLayout(resumeData);
  } else if (format === "professional") {
    doc = buildProfessionalLayout(resumeData);
  } else {
    doc = buildClassicLayout(resumeData);
  }

  return await Packer.toBuffer(doc);
}

// ─── Classic Layout ───────────────────────────────────────────────
function buildClassicLayout(data) {
  const children = [];

  // Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.name || "Your Name", bold: true, size: 48, color: "1a1a2e" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.title || "", size: 24, color: "555555" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join("  |  "), size: 20, color: "666666" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Section helper
  const section = (title) => [
    new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: "1a1a2e" })],
      border: { bottom: { color: "c8f064", size: 8, space: 4, style: BorderStyle.SINGLE } },
      spacing: { before: 240, after: 120 },
    }),
  ];

  // Summary
  if (data.summary) {
    children.push(...section("Professional Summary"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: data.summary, size: 20 })],
        spacing: { after: 120 },
      })
    );
  }

  // Experience
  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    children.push(...section("Experience"));
    experiences.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role || "", bold: true, size: 22 }),
            new TextRun({ text: `  —  ${exp.company || ""}`, size: 22, color: "555555" }),
          ],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({
          children: [new TextRun({ text: exp.duration || "", size: 18, color: "888888", italics: true })],
          spacing: { after: 80 },
        })
      );
      (exp.bullets || []).forEach((bullet) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 20 })],
            bullet: { level: 0 },
            spacing: { after: 40 },
          })
        );
      });
    });
  }

  // Education
  const education = Array.isArray(data.education) ? data.education : [];
  if (education.length) {
    children.push(...section("Education"));
    education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || "", bold: true, size: 22 }),
            new TextRun({ text: `  —  ${edu.institution || ""}`, size: 22, color: "555555" }),
            new TextRun({ text: `  (${edu.year || ""})`, size: 20, color: "888888" }),
          ],
          spacing: { before: 80, after: 60 },
        })
      );
    });
  }

  // Skills
  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (skills.length) {
    children.push(...section("Skills"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: skills.join("  •  "), size: 20 })],
        spacing: { after: 100 },
      })
    );
  }

  // Certifications
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  if (certifications.length) {
    children.push(...section("Certifications"));
    certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: cert, size: 20 })],
          bullet: { level: 0 },
          spacing: { after: 40 },
        })
      );
    });
  }

  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 900, bottom: 720, left: 900 } } }, children }] });
}

// ─── Sidebar Layout ───────────────────────────────────────────────
function buildSidebarLayout(data) {
  const leftCol = [];
  const rightCol = [];

  // Left — contact + skills
  leftCol.push(
    new Paragraph({
      children: [new TextRun({ text: data.name || "", bold: true, size: 32, color: "FFFFFF" })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.title || "", size: 20, color: "c8f064" })],
      spacing: { after: 200 },
    })
  );

  const addLeftSection = (title, items) => {
    leftCol.push(
      new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 18, color: "c8f064" })],
        spacing: { before: 160, after: 80 },
      })
    );
    const safeItems = Array.isArray(items) ? items : [];
    safeItems.forEach((item) => {
      leftCol.push(
        new Paragraph({
          children: [new TextRun({ text: item, size: 18, color: "DDDDDD" })],
          spacing: { after: 40 },
        })
      );
    });
  };

  const contact = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);
  if (contact.length) addLeftSection("Contact", contact);
  
  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (skills.length) addLeftSection("Skills", skills);
  
  const certifications = Array.isArray(data.certifications) ? data.certifications : [];
  if (certifications.length) addLeftSection("Certifications", certifications);

  // Right — summary + experience + education
  const section = (title) =>
    new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: "1a1a2e" })],
      border: { bottom: { color: "c8f064", size: 6, space: 4, style: BorderStyle.SINGLE } },
      spacing: { before: 200, after: 100 },
    });

  if (data.summary) {
    rightCol.push(section("Profile"), new Paragraph({ children: [new TextRun({ text: data.summary, size: 20 })], spacing: { after: 100 } }));
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    rightCol.push(section("Experience"));
    experiences.forEach((exp) => {
      rightCol.push(
        new Paragraph({
          children: [new TextRun({ text: exp.role || "", bold: true, size: 22 }), new TextRun({ text: `  ${exp.company || ""}`, size: 22, color: "555" })],
          spacing: { before: 80, after: 40 },
        }),
        new Paragraph({ children: [new TextRun({ text: exp.duration || "", size: 18, color: "999", italics: true })], spacing: { after: 60 } })
      );
      (exp.bullets || []).forEach((b) => rightCol.push(new Paragraph({ children: [new TextRun({ text: b, size: 20 })], bullet: { level: 0 }, spacing: { after: 40 } })));
    });
  }

  const education = Array.isArray(data.education) ? data.education : [];
  if (education.length) {
    rightCol.push(section("Education"));
    education.forEach((edu) => {
      rightCol.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || "", bold: true, size: 22 }),
            new TextRun({ text: `  ${edu.institution || ""}  (${edu.year || ""})`, size: 20, color: "555" }),
          ],
          spacing: { before: 80, after: 60 },
        })
      );
    });
  }

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: "1a1a2e", type: ShadingType.CLEAR },
            children: leftCol,
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: rightCol,
          }),
        ],
      }),
    ],
  });

  return new Document({ sections: [{ children: [table] }] });
}

// ─── Modern Layout ────────────────────────────────────────────────
function buildModernLayout(data) {
  const children = [];

  // Bold top banner
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.name || "Your Name", bold: true, size: 56, color: "FFFFFF" })],
      alignment: AlignmentType.LEFT,
      shading: { fill: "0e0e1a", type: ShadingType.CLEAR },
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.title || "", size: 26, color: "c8f064" })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: [data.email, data.phone, data.location].filter(Boolean).join("   •   "), size: 20, color: "BBBBBB" })],
      spacing: { after: 240 },
    })
  );

  const section = (title) =>
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 28, color: "1a1a2e" })],
      border: { bottom: { color: "c8f064", size: 10, space: 4, style: BorderStyle.SINGLE } },
      spacing: { before: 280, after: 120 },
    });

  if (data.summary) {
    children.push(section("Profile"), new Paragraph({ children: [new TextRun({ text: data.summary, size: 20 })], spacing: { after: 100 } }));
  }

  // Two-column skills + education
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const skillsContent = skills.map(
    (s) => new Paragraph({ children: [new TextRun({ text: `▸  ${s}`, size: 20 })], spacing: { after: 40 } })
  );
  
  const education = Array.isArray(data.education) ? data.education : [];
  const eduContent = education.map(
    (e) =>
      new Paragraph({
        children: [new TextRun({ text: `${e.degree || ""}`, bold: true, size: 20 }), new TextRun({ text: `\n${e.institution || ""}  (${e.year || ""})`, size: 18, color: "777" })],
        spacing: { after: 80 },
      })
  );

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [section("Skills"), ...skillsContent],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [section("Education"), ...eduContent],
            }),
          ],
        }),
      ],
    })
  );

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    children.push(section("Experience"));
    experiences.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.role || "", bold: true, size: 24 }), new TextRun({ text: `  at  ${exp.company || ""}`, size: 22, color: "444" })],
          spacing: { before: 100, after: 40 },
        }),
        new Paragraph({ children: [new TextRun({ text: exp.duration || "", size: 18, italics: true, color: "888" })], spacing: { after: 80 } })
      );
      (exp.bullets || []).forEach((b) => children.push(new Paragraph({ children: [new TextRun({ text: b, size: 20 })], bullet: { level: 0 }, spacing: { after: 40 } })));
    });
  }

  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 900, bottom: 720, left: 900 } } }, children }] });
}

// ─── Elegant Layout ───────────────────────────────────────────────
function buildElegantLayout(data) {
  const children = [];

  // Centered Header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.name || "", bold: true, size: 44, color: "2c3e50" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: data.title || "", size: 20, color: "7f8c8d", italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: [data.email, data.phone, data.location].filter(Boolean).join("  •  "), size: 18, color: "95a5a6" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  const section = (title) => [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 20, color: "2c3e50" })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "__________________________________________________", size: 8, color: "bdc3c7" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
    }),
  ];

  if (data.summary) {
    children.push(...section("Profile"));
    children.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: 19 })], alignment: AlignmentType.CENTER, spacing: { after: 120 } }));
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    children.push(...section("Experience"));
    experiences.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.role || "", bold: true, size: 20 }), new TextRun({ text: ` | ${exp.company || ""}`, size: 20 })],
          alignment: AlignmentType.LEFT,
          spacing: { before: 100 },
        }),
        new Paragraph({ children: [new TextRun({ text: exp.duration || "", size: 16, italics: true, color: "7f8c8d" })], spacing: { after: 60 } })
      );
      (exp.bullets || []).forEach((b) => children.push(new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 18 })], spacing: { left: 360, after: 40 } })));
    });
  }

  const skills = Array.isArray(data.skills) ? data.skills : [];
  if (skills.length) {
    children.push(...section("Expertise"));
    children.push(new Paragraph({ children: [new TextRun({ text: skills.join("   |   "), size: 18 })], alignment: AlignmentType.CENTER }));
  }

  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 1080, bottom: 720, left: 1080 } } }, children }] });
}

// ─── Professional Layout ──────────────────────────────────────────
function buildProfessionalLayout(data) {
  const children = [];

  // Left-aligned compact header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.name?.toUpperCase() || "", bold: true, size: 36, color: "000000" })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: data.email || "", size: 18 }),
        new TextRun({ text: "  |  ", size: 18, color: "cccccc" }),
        new TextRun({ text: data.phone || "", size: 18 }),
        new TextRun({ text: "  |  ", size: 18, color: "cccccc" }),
        new TextRun({ text: data.location || "", size: 18 }),
      ],
      spacing: { after: 200 },
    })
  );

  const section = (title) => [
    new Paragraph({
      shading: { fill: "f4f4f4", type: ShadingType.CLEAR },
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 18, color: "333333" })],
      spacing: { before: 200, after: 100 },
      indent: { left: 100 },
    }),
  ];

  if (data.summary) {
    children.push(...section("Executive Summary"));
    children.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: 19 })], spacing: { before: 100, after: 100 } }));
  }

  const experiences = Array.isArray(data.experience) ? data.experience : [];
  if (experiences.length) {
    children.push(...section("Professional Experience"));
    experiences.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.company || "", bold: true, size: 20 }), new TextRun({ text: `\t${exp.duration || ""}`, size: 18, color: "666" })],
          tabStops: [{ type: "right", position: 9000 }],
          spacing: { before: 120 },
        }),
        new Paragraph({ children: [new TextRun({ text: exp.role || "", italics: true, size: 19 })], spacing: { after: 40 } })
      );
      (exp.bullets || []).forEach((b) => children.push(new Paragraph({ children: [new TextRun({ text: b, size: 18 })], bullet: { level: 0 }, spacing: { after: 20 } })));
    });
  }

  const education = Array.isArray(data.education) ? data.education : [];
  if (education.length) {
    children.push(...section("Education"));
    education.forEach((edu) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree || ""} from ${edu.institution || ""} (${edu.year || ""})`, size: 18 })], spacing: { before: 60 } }));
    });
  }

  return new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }] });
}

module.exports = { generateDocx };
