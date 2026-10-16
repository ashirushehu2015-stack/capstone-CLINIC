import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  Packer
} from 'docx';
import {
  THESIS_METADATA,
  PRELIMINARY_PAGES,
  THESIS_CHAPTERS,
  THESIS_REFERENCES,
  THESIS_APPENDICES,
  ThesisChapter,
  ThesisSection
} from './capstoneThesisData';

const primaryNavy = '0047AB';
const slateDark = '0F172A';
const slateMuted = '475569';

function createChapterSectionElements(sec: ThesisSection): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Section Heading (e.g. 1.1 Background of the Study)
  elements.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 320, after: 120 },
      children: [
        new TextRun({
          text: `${sec.number} ${sec.title}`,
          bold: true,
          size: 26, // 13pt
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    })
  );

  // Paragraphs
  for (const p of sec.paragraphs) {
    elements.push(
      new Paragraph({
        spacing: { before: 60, after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: p,
            size: 22, // 11pt
            font: 'Calibri',
            color: '111827'
          })
        ]
      })
    );
  }

  // Bullets
  if (sec.bullets && sec.bullets.length > 0) {
    for (const b of sec.bullets) {
      elements.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 40, after: 80 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            ...(b.label
              ? [
                  new TextRun({
                    text: `${b.label} `,
                    bold: true,
                    size: 22,
                    font: 'Calibri',
                    color: '0F172A'
                  })
                ]
              : []),
            new TextRun({
              text: b.text,
              size: 22,
              font: 'Calibri',
              color: '1F2937'
            })
          ]
        })
      );
    }
  }

  // Table if present
  if (sec.table && sec.table.rows && sec.table.rows.length > 0) {
    const tableRows: TableRow[] = [];

    // Header Row
    tableRows.push(
      new TableRow({
        children: sec.table.headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })]
                })
              ],
              shading: { fill: primaryNavy }
            })
        )
      })
    );

    // Data Rows
    for (const r of sec.table.rows) {
      tableRows.push(
        new TableRow({
          children: r.map(
            (c) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: c, size: 20, font: 'Calibri', color: '1E293B' })]
                  })
                ]
              })
          )
        })
      );
    }

    elements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows
      }),
      new Paragraph({ spacing: { before: 120, after: 120 }, children: [] })
    );
  }

  // Helper to render a diagram in Word docx format
  const renderDiagramInDocx = (diag: { figureNumber: string; title: string; caption: string; content: string }) => [
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 240, after: 80 },
      children: [
        new TextRun({
          text: `${diag.figureNumber} — ${diag.title}`,
          bold: true,
          size: 22,
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: diag.content
                .trim()
                .split('\n')
                .map(
                  (line) =>
                    new Paragraph({
                      spacing: { before: 0, after: 0 },
                      children: [
                        new TextRun({
                          text: line || ' ',
                          size: 15, // Monospace representation for diagrams
                          font: 'Consolas',
                          color: '0F172A'
                        })
                      ]
                    })
                ),
              shading: { fill: 'F8FAFC' }
            })
          ]
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 80, after: 180 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: diag.caption,
          italics: true,
          size: 18,
          color: slateMuted,
          font: 'Calibri'
        })
      ]
    })
  ];

  // Diagrams if present (single or multiple)
  if (sec.diagram) {
    elements.push(...renderDiagramInDocx(sec.diagram));
  }
  if (sec.diagrams && sec.diagrams.length > 0) {
    for (const d of sec.diagrams) {
      elements.push(...renderDiagramInDocx(d));
    }
  }

  // Note
  if (sec.note) {
    elements.push(
      new Paragraph({
        spacing: { before: 100, after: 160 },
        children: [
          new TextRun({
            text: sec.note,
            italics: true,
            bold: true,
            size: 20,
            font: 'Calibri',
            color: '0369A1'
          })
        ]
      })
    );
  }

  return elements;
}

/**
 * Builds the Complete Thesis Document (Chapters 1–5, Preliminaries, References, Appendices)
 */
export async function generateThesisUpToChapterTwoBlob(): Promise<Blob> {
  const docChildren: (Paragraph | Table)[] = [];

  // ==========================================
  // 1. COVER / TITLE PAGE
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 80 },
      children: [
        new TextRun({
          text: THESIS_METADATA.university,
          bold: true,
          size: 26,
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [
        new TextRun({
          text: THESIS_METADATA.universitySub,
          bold: true,
          size: 20,
          color: slateMuted,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({
          text: THESIS_METADATA.projectTitle,
          bold: true,
          size: 28,
          color: slateDark,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'BY',
          bold: true,
          size: 20,
          color: slateMuted,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: `GROUP 5 (${THESIS_METADATA.specialization.toUpperCase()})`,
          bold: true,
          size: 22,
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    })
  );

  // Authors Table
  docChildren.push(
    new Table({
      width: { size: 90, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Student Researcher Name', bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
              shading: { fill: primaryNavy }
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Matric / Registration No.', bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
              shading: { fill: primaryNavy }
            })
          ]
        }),
        ...THESIS_METADATA.authors.map(
          (author) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: author.name, bold: true, size: 20, font: 'Calibri' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: author.regNo, size: 20, font: 'Calibri' })] })]
                })
              ]
            })
        )
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 100 },
      children: [
        new TextRun({
          text: THESIS_METADATA.awardText,
          italics: true,
          size: 20,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 60 },
      children: [
        new TextRun({
          text: `Course Code: ${THESIS_METADATA.courseCode}`,
          bold: true,
          size: 20,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({
          text: `Academic Supervisor: ${THESIS_METADATA.supervisor}`,
          bold: true,
          size: 20,
          font: 'Calibri',
          color: primaryNavy
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 400 },
      children: [
        new TextRun({
          text: `${THESIS_METADATA.session} · Sokoto, Nigeria`,
          bold: true,
          size: 20,
          font: 'Calibri'
        })
      ]
    })
  );

  // ==========================================
  // PRELIMINARY PAGES
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: PRELIMINARY_PAGES.declaration.title, bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      spacing: { before: 60, after: 240 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: PRELIMINARY_PAGES.declaration.text, size: 22, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: PRELIMINARY_PAGES.certification.title, bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      spacing: { before: 60, after: 240 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: PRELIMINARY_PAGES.certification.text, size: 22, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: PRELIMINARY_PAGES.dedication.title, bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      spacing: { before: 60, after: 240 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: PRELIMINARY_PAGES.dedication.text, size: 22, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: PRELIMINARY_PAGES.acknowledgements.title, bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      spacing: { before: 60, after: 240 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: PRELIMINARY_PAGES.acknowledgements.text, size: 22, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: PRELIMINARY_PAGES.abstract.title, bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
    }),
    ...PRELIMINARY_PAGES.abstract.paragraphs.map(
      (p) =>
        new Paragraph({
          spacing: { before: 60, after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: p, size: 22, font: 'Calibri' })]
        })
    ),
    new Paragraph({
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({ text: 'Keywords: ', bold: true, size: 22, font: 'Calibri', color: primaryNavy }),
        new TextRun({ text: PRELIMINARY_PAGES.abstract.keywords, italics: true, size: 22, font: 'Calibri' })
      ]
    })
  );

  // List of Abbreviations Table
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: 'LIST OF ABBREVIATIONS', bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Abbreviation', bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
              shading: { fill: primaryNavy }
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Meaning / Definition', bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
              shading: { fill: primaryNavy }
            })
          ]
        }),
        ...PRELIMINARY_PAGES.abbreviations.map(
          (abbr) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: abbr.abbr, bold: true, size: 20, font: 'Calibri' })] })]
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: abbr.meaning, size: 20, font: 'Calibri' })] })]
                })
              ]
            })
        )
      ]
    }),
    new Paragraph({ spacing: { before: 200, after: 200 }, children: [] })
  );

  // ==========================================
  // ALL 5 CHAPTERS
  // ==========================================
  for (const ch of THESIS_CHAPTERS) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 500, after: 100 },
        children: [
          new TextRun({
            text: ch.chapterTitle,
            bold: true,
            size: 32, // 16pt
            color: primaryNavy,
            font: 'Calibri'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 300 },
        children: [
          new TextRun({
            text: ch.subtitle,
            italics: true,
            size: 20,
            color: slateMuted,
            font: 'Calibri'
          })
        ]
      })
    );

    for (const sec of ch.sections) {
      docChildren.push(...createChapterSectionElements(sec));
    }
  }

  // ==========================================
  // REFERENCES
  // ==========================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 500, after: 100 },
      children: [
        new TextRun({
          text: 'REFERENCES',
          bold: true,
          size: 32,
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 240 },
      children: [
        new TextRun({
          text: 'American Psychological Association (APA), 7th Edition',
          italics: true,
          size: 20,
          color: slateMuted,
          font: 'Calibri'
        })
      ]
    }),
    ...THESIS_REFERENCES.map(
      (ref) =>
        new Paragraph({
          spacing: { before: 80, after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: ref,
              size: 20,
              font: 'Calibri',
              color: '111827'
            })
          ]
        })
    )
  );

  // ==========================================
  // APPENDICES
  // ==========================================
  // Appendix A
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 500, after: 80 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixA.title, bold: true, size: 28, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixA.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: THESIS_APPENDICES.appendixA.table.headers.map(
            (h) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: 'FFFFFF' })] })],
                shading: { fill: primaryNavy }
              })
          )
        }),
        ...THESIS_APPENDICES.appendixA.table.rows.map(
          (r) =>
            new TableRow({
              children: r.map(
                (c) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: 'Calibri' })] })]
                  })
              )
            })
        )
      ]
    })
  );

  // Appendix B
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 80 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixB.title, bold: true, size: 28, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixB.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: THESIS_APPENDICES.appendixB.table.headers.map(
            (h) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: 'FFFFFF' })] })],
                shading: { fill: primaryNavy }
              })
          )
        }),
        ...THESIS_APPENDICES.appendixB.table.rows.map(
          (r) =>
            new TableRow({
              children: r.map(
                (c) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: 'Calibri' })] })]
                  })
              )
            })
        )
      ]
    })
  );

  // Appendix C
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 80 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixC.title, bold: true, size: 28, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixC.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
    }),
    ...THESIS_APPENDICES.appendixC.listings.map((l) => [
      new Paragraph({
        spacing: { before: 160, after: 60 },
        children: [new TextRun({ text: l.title, bold: true, size: 22, color: primaryNavy, font: 'Calibri' })]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: l.code.split('\n').map(
                  (line) =>
                    new Paragraph({
                      spacing: { before: 0, after: 0 },
                      children: [new TextRun({ text: line || ' ', size: 16, font: 'Consolas' })]
                    })
                ),
                shading: { fill: 'F8FAFC' }
              })
            ]
          })
        ]
      })
    ]).flat()
  );

  // Appendix D
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 80 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixD.title, bold: true, size: 28, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixD.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
    }),
    ...THESIS_APPENDICES.appendixD.links.map(
      (link) =>
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: `${link.label} `, bold: true, size: 20, font: 'Calibri', color: primaryNavy }),
            new TextRun({ text: link.url, size: 20, font: 'Calibri' })
          ]
        })
    )
  );

  // Appendix E
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 80 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixE.title, bold: true, size: 28, color: primaryNavy, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [new TextRun({ text: THESIS_APPENDICES.appendixE.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: THESIS_APPENDICES.appendixE.table.headers.map(
            (h) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: 'FFFFFF' })] })],
                shading: { fill: primaryNavy }
              })
          )
        }),
        ...THESIS_APPENDICES.appendixE.table.rows.map(
          (r) =>
            new TableRow({
              children: r.map(
                (c) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: 'Calibri' })] })]
                  })
              )
            })
        )
      ]
    })
  );

  const doc = new Document({
    creator: 'Group 5 · Iconic University Sokoto',
    title: `${THESIS_METADATA.projectTitle} (Complete Dissertation)`,
    description: `Capstone Project Report submitted for MIT 800 at Iconic University Sokoto`,
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Iconic University, Sokoto · MIT 800: Al-Eman Clinic EMR System (Argungu)',
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Group 5 | Al-Eman Clinic Capstone Report | Page ',
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' | Iconic University, Sokoto',
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Builds an Individual Chapter (.docx)
 */
export async function generateSingleChapterDocxBlob(chapterNumber: number): Promise<Blob> {
  const chapter = THESIS_CHAPTERS.find((c) => c.chapterNumber === chapterNumber) || THESIS_CHAPTERS[0];

  const docChildren: (Paragraph | Table)[] = [];

  // Header Title Block
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [
        new TextRun({
          text: THESIS_METADATA.university,
          bold: true,
          size: 24,
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 120 },
      children: [
        new TextRun({
          text: THESIS_METADATA.projectTitle,
          bold: true,
          size: 22,
          color: slateDark,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 100 },
      children: [
        new TextRun({
          text: chapter.chapterTitle,
          bold: true,
          size: 32,
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 300 },
      children: [
        new TextRun({
          text: chapter.subtitle,
          italics: true,
          size: 20,
          color: slateMuted,
          font: 'Calibri'
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: 'Course & Degree:', bold: true, size: 20, font: 'Calibri' })] })]
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: `${THESIS_METADATA.courseCode} — ${THESIS_METADATA.specialization}`, size: 20, font: 'Calibri' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Project Group:', bold: true, size: 20, font: 'Calibri' })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${THESIS_METADATA.group} (Abdullahi, Ashiru, Hussaini, Hassana, Muhammad)`, size: 20, font: 'Calibri' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Academic Supervisor:', bold: true, size: 20, font: 'Calibri' })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${THESIS_METADATA.supervisor} · ${THESIS_METADATA.session}`, size: 20, font: 'Calibri' })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Host Organization:', bold: true, size: 20, font: 'Calibri' })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${THESIS_METADATA.hostOrg} (${THESIS_METADATA.contactInfo})`, size: 20, font: 'Calibri' })] })]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { before: 200, after: 200 }, children: [] })
  );

  // Sections
  for (const sec of chapter.sections) {
    docChildren.push(...createChapterSectionElements(sec));
  }

  const doc = new Document({
    creator: 'Group 5 · Iconic University Sokoto',
    title: `${chapter.chapterTitle} - Al-Eman Clinic EMR (Argungu)`,
    sections: [
      {
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${chapter.chapterTitle.split('—')[0].trim()} · Al-Eman Clinic EMR System (Argungu)`,
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Group 5 | ${chapter.chapterTitle.split('—')[0].trim()} | Page `,
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  }),
                  new TextRun({
                    text: ' | Iconic University, Sokoto',
                    size: 18,
                    color: slateMuted,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Trigger download of document in the browser
 */
export async function downloadThesisDocument(chapterNumber?: number): Promise<void> {
  let blob: Blob;
  let filename: string;

  if (chapterNumber === undefined || chapterNumber === 0) {
    blob = await generateThesisUpToChapterTwoBlob();
    filename = `AL_EMAN_CLINIC_CAPSTONE_PROJECT_COMPLETE_DISSERTATION_ICONIC_UNIVERSITY.docx`;
  } else {
    blob = await generateSingleChapterDocxBlob(chapterNumber);
    filename = `AL_EMAN_CLINIC_CHAPTER_${chapterNumber}_ICONIC_UNIVERSITY.docx`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
