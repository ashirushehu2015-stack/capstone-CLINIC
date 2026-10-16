import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';

const router = Router();

// Clinic Dashboard Metrics (Real calculated database counts, respecting permissions)
router.get('/dashboard', requireAuth, (req: AuthRequest, res: Response) => {
  const role = req.user?.role || '';
  const today = new Date().toISOString().split('T')[0];

  // Base clinical counts
  const totalPatients = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE status = 'active'").get() as any).c;
  const patientsToday = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE date(created_at) = date(?)").get(today) as any).c;
  const visitsToday = (db.prepare("SELECT COUNT(*) as c FROM patient_visits WHERE date(visit_date) = date(?)").get(today) as any).c;

  const queueCounts = db.prepare(`
    SELECT stage, COUNT(*) as count
    FROM patient_visits
    WHERE stage != 'completed'
    GROUP BY stage
  `).all() as Array<{ stage: string; count: number }>;

  const waitingForConsultation = (db.prepare("SELECT COUNT(*) as c FROM patient_visits WHERE stage = 'consultation'").get() as any).c;
  const pendingLabRequests = (db.prepare("SELECT COUNT(*) as c FROM laboratory_requests WHERE status != 'completed' AND status != 'cancelled'").get() as any).c;
  const pendingPrescriptions = (db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'pending'").get() as any).c;
  const lowStockCount = (db.prepare("SELECT COUNT(*) as c FROM medicines WHERE is_active = 1 AND stock_quantity <= reorder_level").get() as any).c;

  const baseMetrics: any = {
    totalPatients,
    patientsToday,
    visitsToday,
    waitingForConsultation,
    pendingLabRequests,
    pendingPrescriptions,
    lowStockCount,
    queueCounts
  };

  // Financial Metrics: strictly permission-gated (accountant, manager, admin only)
  if (['accountant', 'manager', 'admin'].includes(role)) {
    const todayRevenue = (db.prepare(`
      SELECT SUM(amount) as s FROM payments WHERE date(created_at) = date(?) AND status = 'confirmed'
    `).get(today) as any).s || 0;

    const outstandingBalance = (db.prepare(`
      SELECT SUM(balance_due) as s FROM invoices WHERE status IN ('unpaid', 'partially_paid')
    `).get() as any).s || 0;

    const totalCollectedMonth = (db.prepare(`
      SELECT SUM(amount) as s FROM payments WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'confirmed'
    `).get() as any).s || 0;

    baseMetrics.financial = {
      todayRevenue,
      outstandingBalance,
      totalCollectedMonth
    };
  }

  // Doctor-specific metrics
  if (role === 'doctor') {
    const myConsultationsToday = ((db.prepare(`
      SELECT COUNT(*) as c FROM consultations WHERE doctor_id = ? AND date(created_at) = date(?)
    `) as any).get(req.user?.id || '', today) as any).c;
    baseMetrics.myConsultationsToday = myConsultationsToday;
  }

  // Nurse-specific metrics
  if (role === 'nurse') {
    const vitalsRecordedToday = ((db.prepare(`
      SELECT COUNT(*) as c FROM vital_signs WHERE recorded_by = ? AND date(created_at) = date(?)
    `) as any).get(req.user?.id || '', today) as any).c;
    baseMetrics.vitalsRecordedToday = vitalsRecordedToday;
  }

  // Lab-specific metrics
  if (role === 'lab_tech') {
    const unverifiedTests = (db.prepare(`
      SELECT COUNT(*) as c FROM laboratory_tests WHERE status IN ('sample_collected', 'analyzed')
    `).get() as any).c;
    baseMetrics.unverifiedTests = unverifiedTests;
  }

  res.json({ metrics: baseMetrics });
});

// Comprehensive Reports
router.get('/analytics', requireAuth, requireRoles('manager', 'admin', 'accountant'), (req: AuthRequest, res: Response) => {
  // Top Diagnoses
  const topDiagnoses = db.prepare(`
    SELECT primary_diagnosis, COUNT(*) as count
    FROM consultations
    GROUP BY primary_diagnosis
    ORDER BY count DESC
    LIMIT 5
  `).all();

  // Visits by stage
  const visitsByStage = db.prepare(`
    SELECT stage, COUNT(*) as count
    FROM patient_visits
    GROUP BY stage
  `).all();

  // Revenue by payment method
  const revenueByMethod = db.prepare(`
    SELECT payment_method, SUM(amount) as total, COUNT(*) as count
    FROM payments
    WHERE status = 'confirmed'
    GROUP BY payment_method
  `).all();

  // Stock inventory valuation
  const inventoryValuation = db.prepare(`
    SELECT SUM(stock_quantity * purchase_cost) as total_cost_value,
           SUM(stock_quantity * selling_price) as total_retail_value,
           COUNT(*) as active_medicines
    FROM medicines
    WHERE is_active = 1
  `).get() as any;

  res.json({
    topDiagnoses,
    visitsByStage,
    revenueByMethod,
    inventoryValuation
  });
});

// Helper to generate docx buffer for single chapter or complete thesis up to Chapter 2
async function buildThesisDocxBuffer(chapterNumber?: number) {
  const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, PageNumber, Packer } = await import('docx');
  const { THESIS_CHAPTERS, THESIS_METADATA, PRELIMINARY_PAGES, THESIS_REFERENCES, THESIS_APPENDICES } = await import('../../src/lib/capstoneThesisData.ts');

  const primaryNavy = '0047AB';
  const slateDark = '0F172A';
  const slateMuted = '475569';

  const docChildren: any[] = [];
  const isComplete = !chapterNumber || chapterNumber === 0;
  const targetChapter = isComplete ? null : (THESIS_CHAPTERS.find(c => c.chapterNumber === chapterNumber) || THESIS_CHAPTERS[0]);

  // Section builder helper
  const addSectionElements = (sec: any) => {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: `${sec.number} ${sec.title}`,
            bold: true,
            size: 26,
            color: primaryNavy,
            font: 'Calibri'
          })
        ]
      })
    );

    for (const p of sec.paragraphs) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 120 },
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: p,
              size: 22,
              font: 'Calibri',
              color: '111827'
            })
          ]
        })
      );
    }

    if (sec.bullets && sec.bullets.length > 0) {
      for (const b of sec.bullets) {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 80 },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              ...(b.label
                ? [new TextRun({ text: `${b.label} `, bold: true, size: 22, font: 'Calibri', color: '0F172A' })]
                : []),
              new TextRun({ text: b.text, size: 22, font: 'Calibri', color: '1F2937' })
            ]
          })
        );
      }
    }

    if (sec.table && sec.table.rows && sec.table.rows.length > 0) {
      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: sec.table.headers.map(
                (h: string) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
                    shading: { fill: primaryNavy }
                  })
              )
            }),
            ...sec.table.rows.map(
              (r: string[]) =>
                new TableRow({
                  children: r.map(
                    (c: string) =>
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, font: 'Calibri', color: '1E293B' })] })]
                      })
                  )
                })
            )
          ]
        }),
        new Paragraph({ spacing: { before: 120, after: 120 }, children: [] })
      );
    }

    // Diagrams if present
    const renderDiag = (diag: any) => [
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
                  .map((line: string) =>
                    new Paragraph({
                      spacing: { before: 0, after: 0 },
                      children: [
                        new TextRun({
                          text: line || ' ',
                          size: 15,
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

    if (sec.diagram) {
      docChildren.push(...renderDiag(sec.diagram));
    }
    if (sec.diagrams && sec.diagrams.length > 0) {
      for (const d of sec.diagrams) {
        docChildren.push(...renderDiag(d));
      }
    }

    if (sec.note) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 140 },
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
  };

  if (isUpToChapterTwo) {
    // 1. Cover / Title Page
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
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
            text: `GROUP 5 (${THESIS_METADATA.specialization})`,
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
                children: [new Paragraph({ children: [new TextRun({ text: 'Student Name', bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
                shading: { fill: primaryNavy }
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'Matric / Reg. No.', bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
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

    // Preliminary Pages: Declaration, Certification, Dedication, Acknowledgements, Abstract
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
        children: [new TextRun({ text: PRELIMINARY_PAGES.abstract.title, bold: true, size: 26, color: primaryNavy, font: 'Calibri' })]
      }),
      ...PRELIMINARY_PAGES.abstract.paragraphs.map(
        p => new Paragraph({
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

    // ALL 5 CHAPTERS
    for (const ch of THESIS_CHAPTERS) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 500, after: 80 },
          children: [new TextRun({ text: ch.chapterTitle, bold: true, size: 30, color: primaryNavy, font: 'Calibri' })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 240 },
          children: [new TextRun({ text: ch.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
        })
      );

      for (const sec of ch.sections) {
        addSectionElements(sec);
      }
    }

    // REFERENCES
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 500, after: 100 },
        children: [new TextRun({ text: 'REFERENCES', bold: true, size: 32, color: primaryNavy, font: 'Calibri' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 240 },
        children: [new TextRun({ text: 'American Psychological Association (APA), 7th Edition', italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
      }),
      ...THESIS_REFERENCES.map(
        (ref: string) =>
          new Paragraph({
            spacing: { before: 80, after: 120 },
            alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text: ref, size: 20, font: 'Calibri', color: '111827' })]
          })
      )
    );

    // APPENDICES
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
              (h: string) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
                  shading: { fill: primaryNavy }
                })
            )
          }),
          ...THESIS_APPENDICES.appendixA.table.rows.map(
            (r: string[]) =>
              new TableRow({
                children: r.map(
                  (c: string) =>
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: 'Calibri' })] })]
                    })
                )
              })
          )
        ]
      }),
      new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }),

      // Appendix B
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
              (h: string) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Calibri', color: 'FFFFFF' })] })],
                  shading: { fill: primaryNavy }
                })
            )
          }),
          ...THESIS_APPENDICES.appendixB.table.rows.map(
            (r: string[]) =>
              new TableRow({
                children: r.map(
                  (c: string) =>
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: 'Calibri' })] })]
                    })
                )
              })
          )
        ]
      })
    );

  } else {
    // Single Chapter
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: targetChapter!.chapterTitle, bold: true, size: 32, color: primaryNavy, font: 'Calibri' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 240 },
        children: [new TextRun({ text: targetChapter!.subtitle, italics: true, size: 20, color: slateMuted, font: 'Calibri' })]
      })
    );

    for (const sec of targetChapter!.sections) {
      addSectionElements(sec);
    }
  }

  const doc = new Document({
    creator: 'Group 5 · Iconic University Sokoto',
    title: isComplete ? `${THESIS_METADATA.projectTitle} (Complete Capstone Dissertation)` : `${targetChapter!.chapterTitle}`,
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
                    text: `Group 5 | ${isComplete ? 'Complete Dissertation' : targetChapter!.chapterTitle.split('—')[0].trim()} | Page `,
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

  return await Packer.toBuffer(doc);
}

// Endpoint to download Full Capstone Dissertation (.docx)
router.get('/thesis/download', async (_req, res: Response) => {
  try {
    const buffer = await buildThesisDocxBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="AL_EMAN_CLINIC_CAPSTONE_PROJECT_COMPLETE_DISSERTATION_ICONIC_UNIVERSITY.docx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Failed to generate complete thesis docx:', err);
    res.status(500).json({ error: 'Failed to generate complete thesis document', details: err.message });
  }
});

// Endpoint to download an individual Chapter (.docx)
router.get('/chapter/:num/download', async (req, res: Response) => {
  try {
    const chapterNum = parseInt(req.params.num, 10) || 1;
    const buffer = await buildThesisDocxBuffer(chapterNum);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="AL_EMAN_CLINIC_CHAPTER_${chapterNum}_ICONIC_UNIVERSITY.docx"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error(`Failed to generate chapter ${req.params.num} docx:`, err);
    res.status(500).json({ error: 'Failed to generate chapter document', details: err.message });
  }
});

// Aliases for convenience
router.get('/chapter1/download', async (_req, res: Response) => {
  try {
    const buffer = await buildThesisDocxBuffer(1);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="AL_EMAN_CLINIC_CHAPTER_1_ICONIC_UNIVERSITY.docx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Failed to generate chapter 1 docx:', err);
    res.status(500).json({ error: 'Failed to generate Chapter 1 document', details: err.message });
  }
});

router.get('/chapter2/download', async (_req, res: Response) => {
  try {
    const buffer = await buildThesisDocxBuffer(2);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="AL_EMAN_CLINIC_CHAPTER_2_ICONIC_UNIVERSITY.docx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Failed to generate chapter 2 docx:', err);
    res.status(500).json({ error: 'Failed to generate Chapter 2 document', details: err.message });
  }
});

router.get('/chapter3/download', async (_req, res: Response) => {
  try {
    const buffer = await buildThesisDocxBuffer(3);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="AL_EMAN_CLINIC_CHAPTER_3_ICONIC_UNIVERSITY.docx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Failed to generate chapter 3 docx:', err);
    res.status(500).json({ error: 'Failed to generate Chapter 3 document', details: err.message });
  }
});

router.get('/chapter4/download', async (_req, res: Response) => {
  try {
    const buffer = await buildThesisDocxBuffer(4);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="AL_EMAN_CLINIC_CHAPTER_4_ICONIC_UNIVERSITY.docx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Failed to generate chapter 4 docx:', err);
    res.status(500).json({ error: 'Failed to generate Chapter 4 document', details: err.message });
  }
});

router.get('/chapter5/download', async (_req, res: Response) => {
  try {
    const buffer = await buildThesisDocxBuffer(5);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="AL_EMAN_CLINIC_CHAPTER_5_ICONIC_UNIVERSITY.docx"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Failed to generate chapter 5 docx:', err);
    res.status(500).json({ error: 'Failed to generate Chapter 5 document', details: err.message });
  }
});

export default router;
