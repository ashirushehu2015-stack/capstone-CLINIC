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
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  Packer
} from 'docx';

export interface ChapterSection {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: { label?: string; text: string }[];
  note?: string;
}

export const CHAPTER_ONE_DATA = {
  projectTitle: 'DESIGN AND IMPLEMENTATION OF AN ENTERPRISE-GRADE WEB-BASED ELECTRONIC MEDICAL RECORDS AND CLINIC MANAGEMENT SYSTEM (MEDIPULSE)',
  institution: 'AL-EMAN CLINIC AND MATERNITY HOME, ARGUNGU, KEBBI STATE',
  academicProgram: 'Master of Information Technology (MIT) Capstone Project',
  contactInfo: 'No. 19 Gulma Road, Argungu, Kebbi State · Tel: 08069452164 · 07066694834',
  copyright: 'Copyright @ MIT Capstone Project',
  sections: [
    {
      id: '1.1',
      number: '1.1',
      title: 'Background of the Study',
      paragraphs: [
        `The rapid digitization of healthcare delivery in Nigeria has moved core clinical processes — patient registration, triage vital signs documentation, physician consultations, laboratory investigations, pharmaceutical dispensing, and financial accounting — from manual paper ledgers onto networked, computer-based hospital information systems. In primary and secondary healthcare institutions across Northern Nigeria, particularly in Kebbi State, healthcare facilities face an acute burden of maternal and child health complications, communicable infections (such as malaria, typhoid, and gastroenteritis), and emerging chronic non-communicable disorders (such as hypertension and diabetes). Community healthcare providers increasingly recognize that delivering safe, accountable, and high-velocity healthcare requires modernizing the operational infrastructure of private and faith-based clinics and maternity homes, which provide over 60% of frontline maternal and outpatient services in rural and semi-urban communities (Federal Ministry of Health [FMoH], 2023).`,
        `Healthcare operations, by their intrinsic nature, generate an intricate stream of clinical and administrative data that encapsulates patient vitals, diagnostic histories, drug sensitivities, pharmaceutical inventory movements, and revenue transactions. When captured systematically in a unified Electronic Medical Record (EMR) system, this data serves as the foundation for clinical decision support, epidemiological morbidity surveillance, inventory safeguarding, and financial auditability. Conversely, when clinical data remains trapped in physical paper folders, the vulnerabilities are catastrophic: patient folders are routinely lost or misfiled, historical vital signs are unavailable during acute obstetric crises, illegible physician handwriting leads to adverse medication dispensing errors, diagnostic lab results are misplaced before reaching the consulting physician, and cash payments recorded on carbon-copy receipts are prone to severe revenue leakages.`,
        `The Nigerian healthcare environment makes digital transformation urgent rather than theoretical. Nigeria continues to record one of the highest maternal mortality ratios globally, estimated by the World Health Organization at approximately 1,047 maternal deaths per 100,000 live births (WHO, as cited in National Demographic and Health Survey [NDHS], 2024), with North-Western states experiencing acute vulnerability due to delays in triage recognition, emergency referral, and uncoordinated intra-facility transitions (Daily Trust, 2024; Vanguard, 2024). Furthermore, studies by the National Health Insurance Authority (NHIA, 2024) indicate that sub-Saharan private healthcare facilities lose between 18% and 32% of billable revenue to uncollected invoices, unrecorded pharmacy dispensing, and manual reconciliation errors. For an active frontline maternity and outpatient institution such as Al-Eman Clinic and Maternity Home in Argungu, which attends to hundreds of expectant mothers, neonates, and outpatients weekly, an integrated clinic management system is therefore a life-saving clinical necessity and an indispensable operational control.`,
        `A clinical management and EMR system in this context is software that continuously orchestrates the multi-departmental workflow of a healthcare facility — capturing biometric vitals at nursing triage, routing patients through dynamic queues, presenting physicians with structured consultation templates and ICD-10 diagnostic coding, automating computerized physician order entry (CPOE) for laboratory and pharmacy services, decrementing pharmaceutical inventory in real time, issuing itemized electronic invoices, and logging every transaction in a tamper-evident audit trail. For a private community maternity and healthcare provider, such a system must do more than store demographic records: it must guarantee strict Role-Based Access Control (RBAC) to protect medical confidentiality, prevent pharmaceutical stock pilferage, enforce daily cashier reconciliation, and compile sign-off-ready epidemiological and financial reports. This project, Medipulse (Al-Eman Clinic Management System), was conceived and built to satisfy exactly these requirements for Al-Eman Clinic and Maternity Home.`
      ]
    },
    {
      id: '1.2',
      number: '1.2',
      title: 'Background of the Host Organization (Al-Eman Clinic and Maternity Home)',
      paragraphs: [
        `Al-Eman Clinic and Maternity Home is a registered community healthcare and obstetric institution situated at No. 19 Gulma Road, Argungu, Kebbi State, Nigeria (Contact Numbers: 08069452164, 07066694834). Established to bridge the critical maternal and general outpatient healthcare gap within the historic Argungu Emirate and adjoining rural farming and pastoral settlements along the Gulma-Argungu arterial corridor, the clinic provides essential round-the-clock (24/7) healthcare services to thousands of residents across Kebbi State.`,
        `The clinic's clinical departments and operational scope encompass six primary healthcare wings:`
      ],
      bullets: [
        {
          label: 'Maternal, Neonatal, and Child Health (MNCH):',
          text: 'Comprehensive antenatal care (ANC) booking, high-risk pregnancy screening, labor ward and normal spontaneous vaginal delivery (SVD), emergency post-partum hemorrhage (PPH) stabilization, neonatal resuscitation, postnatal care (PNC), and routine childhood immunization tracking.'
        },
        {
          label: 'General Outpatient & Inpatient Wards (GOPD & Admissions):',
          text: 'Primary triage, clinical consultations for acute infectious diseases (malaria, enteric fevers, gastroenteritis, pneumonia), chronic disease monitoring (hypertension, diabetes mellitus), minor surgical procedures, and inpatient ward admissions across dedicated male, female, and maternity wards.'
        },
        {
          label: 'Diagnostic Laboratory Services:',
          text: 'Clinical pathology encompassing hematology (PCV, full blood counts, blood grouping), parasitology (malaria parasite Giemsa microscopy and rapid diagnostic tests), chemical pathology (urinalysis, blood glucose monitoring), and serology (Widal agglutination, hepatitis B/C screening, retroviral screening).'
        },
        {
          label: 'Diagnostic Ultrasonography:',
          text: 'Real-time abdominal and obstetric ultrasound imaging for fetal biometry, gestational age verification, placental localization, and pelvic evaluation.'
        },
        {
          label: 'Formulary & Dispensary Pharmacy:',
          text: 'Procurement, secure warehousing, and dispensing of essential medicines, pediatric suspensions, anti-infectives, intravenous fluids, and emergency uterotonic agents, paired with patient counseling on dosage regimens.'
        },
        {
          label: 'Health Records & Revenue Accounts:',
          text: 'Patient demographic intake, master patient indexing, tariff catalog maintenance, multi-tender billing (Cash, POS, Electronic Bank Transfer), patient debt tracking, and daily financial reconciliation.'
        }
      ],
      note: 'Note for the team: Attach Al-Eman Clinic and Maternity Home’s signed Institutional Letter of Acceptance/Authorization (Deliverable 1 Project Charter), Official Clinical Organogram, and Practice License issued by the Kebbi State Ministry of Health as Annex A.'
    },
    {
      id: '1.3',
      number: '1.3',
      title: 'Statement of the Problem',
      paragraphs: [
        `Prior to the inception of this project, Al-Eman Clinic and Maternity Home relied entirely on manual paper-based filing cabinets, physical ledger notebooks, and carbon-copy receipt booklets to manage its clinical and administrative operations. With an expanding patient register exceeding 1,200 registered families and over 40 to 60 daily outpatient and obstetric visits, this manual documentation model suffered critical operational bottlenecks:`,
      ],
      bullets: [
        {
          label: 'Fragmented records and absence of longitudinal medical history:',
          text: 'Patient health records were scattered across physical registration ledgers, loose examination cards, and departmental notebooks. Consulting physicians were frequently forced to assess acutely ill patients and pregnant mothers without access to historical vital signs, drug allergies, prior obstetric complications, or chronic medication histories.'
        },
        {
          label: 'Physical card loss, deterioration, and severe triage bottlenecks:',
          text: 'Paper patient folders frequently suffered physical damage, shelf misfiling, or complete loss. Front-desk personnel routinely spent 25 to 45 minutes searching through packed archival racks to retrieve a single card, causing extended waiting times and dangerously delaying medical attention for febrile infants and laboring mothers.'
        },
        {
          label: 'Triage vitals disconnection and unflagged clinical emergencies:',
          text: 'Nurses recorded vital signs on physical slips that had to be manually carried between rooms. Critical biometric indicators of hypertensive crisis (severe pre-eclampsia), severe hypothermia, or septic tachycardia were not electronically flagged, increasing the risk of adverse clinical outcomes.'
        },
        {
          label: 'Handwritten prescription illegibility and uncoordinated dispensing:',
          text: 'Illegible physician handwriting on prescription slips created substantial risks of medication dispensing errors. Furthermore, the dispensary lacked real-time integration with the consultation room, leading to frequent inventory stockouts, unaccounted drug depletion, and dispensing discrepancies.'
        },
        {
          label: 'Delayed, unstandardized diagnostic laboratory tracking:',
          text: 'Laboratory test requests were manually hand-carried on loose paper slips. Specimen tracking was unstandardized, and completed test results often sat in the laboratory for hours before being delivered back to the consulting room, delaying urgent therapeutic interventions.'
        },
        {
          label: 'Revenue leakage and unverified financial reconciliation:',
          text: 'Cashiers issued handwritten, multi-copy receipts that were difficult to reconcile against services actually rendered in the consultation, laboratory, and pharmacy units. Unrecorded credit dispensing, arithmetic errors, and lack of daily cashier shift reconciliation created substantial financial losses.'
        },
        {
          label: 'Complete absence of role separation and security audit trails:',
          text: 'Paper records offered zero access control or accountability: any individual with physical access to the filing room could inspect, alter, or misplace sensitive patient medical records without leaving an auditable footprint, violating healthcare confidentiality standards.'
        }
      ]
    },
    {
      id: '1.4',
      number: '1.4',
      title: 'Aim and Objectives of the Project',
      paragraphs: [
        `Aim: To design, develop, and deploy an enterprise-grade, secure, web-based Electronic Medical Records and Clinic Operations Management System (Medipulse) for Al-Eman Clinic and Maternity Home that automates patient registration, orchestrates real-time patient queueing, digitizes nursing triage vitals, streamlines physician consultation with ICD diagnostic coding, coordinates pharmacy inventory and diagnostic laboratory testing, enforces role-based financial invoicing and reconciliation, and generates auditable administrative and epidemiological reports.`
      ],
      bullets: [
        {
          label: 'Objective 1 — Workflow Requirements Analysis:',
          text: 'Analyze and document Al-Eman Clinic’s end-to-end clinical and administrative workflows across reception, nursing triage, doctor consultation, laboratory diagnostics, pharmacy dispensing, and cashier accounting.'
        },
        {
          label: 'Objective 2 — Software Architecture Design:',
          text: 'Design a sustainable, layered, multi-tier software architecture separating presentation (React, Tailwind CSS), RESTful API business logic (Node.js, Express), and an ACID-compliant relational persistence layer (SQLite) with strict foreign key constraints.'
        },
        {
          label: 'Objective 3 — Cryptographic Role-Based Authentication:',
          text: 'Develop a secure operator authentication portal enforcing Role-Based Access Control (RBAC) across 9 distinct staff roles (System Admin, Clinic Manager, Doctor/Clinician, Staff Nurse, Pharmacist, Lab Scientist, Cashier/Accountant, Receptionist, Health Records Officer) with bcrypt password hashing (salt rounds = 10) and tamper-resistant JSON Web Tokens.'
        },
        {
          label: 'Objective 4 — Master Patient Registry & Real-Time Queueing:',
          text: 'Implement a centralized Master Patient Index (MPI) with unique hospital card numbers, demographic validation, next-of-kin records, and an automated live patient queue tracking encounters across six clinical stages (Checked-In, Triaged, Consultation, Lab Pending, Pharmacy Pending, Completed).'
        },
        {
          label: 'Objective 5 — Nursing Triage & Early-Warning Vitals Engine:',
          text: 'Construct an interactive nursing triage interface capturing blood pressure, pulse rate, axillary temperature, respiratory rate, SpO2, BMI, and random blood glucose, with automated color-coded clinical alerts for hypertensive emergencies and fever.'
        },
        {
          label: 'Objective 6 — Physician Consultation EMR & CPOE:',
          text: 'Build a comprehensive doctor consultation EMR interface capturing chief complaints, history of presenting illness, systemic examination, ICD-10 diagnostic coding, and integrated Computerized Physician Order Entry (CPOE) for laboratory investigations and electronic prescriptions.'
        },
        {
          label: 'Objective 7 — Pharmacy Formulary & Diagnostic Laboratory Management:',
          text: 'Implement an active pharmaceutical formulary tracking stock batches, expiry dates, and reorder levels with real-time stock deduction upon dispensing, paired with a diagnostic laboratory tracker managing test requests, specimen processing, and quantitative/qualitative result verification.'
        },
        {
          label: 'Objective 8 — Automated Cashier Invoicing & Shift Reconciliation:',
          text: 'Develop an automated financial billing engine that compiles consultations, laboratory tests, and medications into itemized invoices, supports multi-channel payment recording (Cash, POS, Transfer), calculates outstanding balances, and generates daily cashier reconciliation summaries.'
        },
        {
          label: 'Objective 9 — System Testing, Benchmarking & Deployment:',
          text: 'Conduct rigorous unit, integration, and user-acceptance testing (UAT) with clinical staff at Al-Eman Clinic, deploy the solution in a live production environment, and compile comprehensive technical, user, and academic documentation for institutional sustainability.'
        }
      ]
    },
    {
      id: '1.5',
      number: '1.5',
      title: 'Scope of the Project',
      paragraphs: [
        `The scope of this project encompasses functional, technical, and institutional dimensions specifically tailored to Al-Eman Clinic and Maternity Home:`,
      ],
      bullets: [
        {
          label: 'Functional Scope:',
          text: 'The system encompasses nine fully integrated operational modules: (1) Reception & Master Patient Registry, (2) Live Visits & Queue Orchestration, (3) Nursing Station & Vitals Triage, (4) Doctor Consultation EMR, (5) Diagnostic Laboratory Management, (6) Pharmacy & Inventory Control, (7) Cashier Invoicing & Shift Reconciliation, (8) Clinical Analytics & Morbidity Surveillance, and (9) Staff Administration & System Audit Logging.'
        },
        {
          label: 'Technical Scope:',
          text: 'The architecture employs a modern full-stack TypeScript stack comprising a React 19 Single Page Application (SPA), Tailwind CSS for responsive clinical UI, Node.js and Express for REST API routing, an embedded SQLite database engine with foreign-key transactional integrity, bcryptjs for cryptographic credential hashing, and JWT bearer tokens for stateless session verification.'
        },
        {
          label: 'Institutional and Geographic Scope:',
          text: 'The software is deployed and operationalized specifically for Al-Eman Clinic and Maternity Home located at No. 19 Gulma Road, Argungu, Kebbi State, serving outpatients, inpatients, and obstetric cases across the Argungu Emirate.'
        },
        {
          label: 'Project Delimitations:',
          text: 'The current phase deliberately focuses on intra-clinic local-area network and cloud deployment. Complex integrations such as high-bandwidth Picture Archiving and Communication Systems (PACS) for raw DICOM CT/MRI imaging and automated external health insurance clearinghouses (NHIA automated claim adjudicators) are outside the primary scope of this release and earmarked for future iterative milestones.'
        }
      ]
    },
    {
      id: '1.6',
      number: '1.6',
      title: 'Significance of the Study',
      paragraphs: [
        `The deployment of Medipulse at Al-Eman Clinic and Maternity Home yields profound practical, clinical, administrative, and academic benefits:`,
      ],
      bullets: [
        {
          label: 'To Clinicians and Nursing Staff:',
          text: 'Provides instant, instantaneous access to longitudinal patient histories, eliminates the risk of missing prior medical notes, flags dangerous biometric anomalies in triage, and eradicates medication errors arising from illegible handwritten prescriptions.'
        },
        {
          label: 'To Patients and Expectant Mothers:',
          text: 'Drastically curtails clinic waiting times from an average of over two hours to under thirty minutes, ensures seamless handoffs between nursing, doctor, laboratory, and pharmacy stations, and safeguards confidential health records against physical damage and unauthorized disclosure.'
        },
        {
          label: 'To Clinic Management and Financial Controllers:',
          text: 'Plugs operational revenue leakages by ensuring that every consultation, laboratory test, and dispensed pharmaceutical is electronically billed; provides real-time visibility into pharmaceutical stock valuation and impending expiries; and automates end-of-day cashier reconciliations.'
        },
        {
          label: 'To Health Regulators and Epidemiologists:',
          text: 'Generates automated, auditable morbidity surveillance metrics (such as top clinical diagnoses, maternal attendance rates, and antimicrobial utilization trends) enabling evidence-based reporting to the Kebbi State Ministry of Health and public health agencies.'
        },
        {
          label: 'To Academic Scholarship and Health Informatics:',
          text: 'Provides an empirical, production-validated blueprint demonstrating how modern open-source web technologies can be architected to deliver resilient, low-latency, and cost-effective clinic management solutions in developing sub-Saharan healthcare environments.'
        }
      ]
    },
    {
      id: '1.7',
      number: '1.7',
      title: 'Operational Definition of Terms',
      paragraphs: [
        `To ensure clarity and contextual consistency throughout this capstone project report, the following technical and clinical terms are defined in accordance with their operational usage in this system:`,
      ],
      bullets: [
        {
          label: 'Electronic Medical Record (EMR):',
          text: 'A digitized, legal clinical record of a patient’s health encounters created, documented, and stored within the clinical management software of Al-Eman Clinic.'
        },
        {
          label: 'Master Patient Index (MPI):',
          text: 'An authoritative database registry containing unique identifiers (Hospital Numbers), demographic profiles, and contact details for every registered patient.'
        },
        {
          label: 'Triage:',
          text: 'The systematic nursing assessment of arriving patients to measure vital signs, compute body mass index (BMI), identify critical physiological abnormalities, and prioritize urgency of medical care.'
        },
        {
          label: 'Computerized Physician Order Entry (CPOE):',
          text: 'The electronic entry of clinical diagnostic requests and pharmaceutical prescriptions directly by a licensed medical practitioner into the software system.'
        },
        {
          label: 'Role-Based Access Control (RBAC):',
          text: 'A security mechanism that restricts system permissions, data access, and administrative privileges strictly to authenticated users based on their defined organizational role.'
        },
        {
          label: 'Formulary & Stock Decrementing:',
          text: 'An approved list of pharmaceuticals maintained within the clinic pharmacy, wherein available stock balances are automatically deducted in real time as prescriptions are verified and dispensed.'
        },
        {
          label: 'Cashier Shift Reconciliation:',
          text: 'The administrative procedure of cross-referencing total electronic invoices, recorded cash collections, POS receipts, and bank transfers against physical cash collected during a staff member’s duty shift.'
        },
        {
          label: 'Morbidity Surveillance:',
          text: 'The automated aggregation and statistical ranking of clinical diagnoses over a defined reporting interval to identify prevalent disease burdens in the clinic catchment population.'
        }
      ]
    },
    {
      id: '1.8',
      number: '1.8',
      title: 'Organization of Subsequent Chapters',
      paragraphs: [
        `The remainder of this capstone project report is structured into four subsequent chapters:`,
        `Chapter Two provides a comprehensive Literature Review, evaluating the historical evolution of hospital information systems, theoretical models of technology acceptance in healthcare (TAM), empirical studies on EMR implementations across sub-Saharan Africa, and a comparative appraisal of existing clinical software architectures.`,
        `Chapter Three details the System Analysis and Methodology, outlining the Agile/Iterative Software Development Life Cycle (SDLC) employed, clinical requirements elicitation techniques, Unified Modeling Language (UML) use case models, Data Flow Diagrams (DFDs), Entity-Relationship (ER) relational database schemas, and architectural design patterns.`,
        `Chapter Four presents the System Design, Implementation, and Testing, documenting the modular construction of the frontend user interface, backend RESTful API services, SQLite database indexing, cryptographic security enforcement, unit test results, integration benchmarks, and user-acceptance testing (UAT) feedback from clinical personnel at Al-Eman Clinic.`,
        `Chapter Five delivers the Summary, Conclusion, and Recommendations, synthesizing the key engineering deliverables, evaluating how the specific objectives were achieved, discussing operational challenges and mitigation strategies, and presenting recommendations for future enhancements, including mobile telemedicine extensions and automated national health insurance claims processing.`
      ]
    }
  ]
};

/**
 * Builds the Word Document (.docx) using the docx library
 */
export async function generateChapterOneDocxBlob(): Promise<Blob> {
  const primaryNavy = '0047AB';
  const slateDark = '1E293B';
  const slateMuted = '64748B';

  const docChildren: (Paragraph | Table)[] = [];

  // Title Block
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'MASTER OF INFORMATION TECHNOLOGY (MIT) CAPSTONE PROJECT',
          bold: true,
          size: 24, // 12pt
          color: primaryNavy,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 160 },
      children: [
        new TextRun({
          text: 'AL-EMAN CLINIC AND MATERNITY HOME · ARGUNGU, KEBBI STATE',
          bold: true,
          size: 22, // 11pt
          color: slateDark,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 360 },
      children: [
        new TextRun({
          text: 'CHAPTER ONE — INTRODUCTION',
          bold: true,
          size: 36, // 18pt
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
          text: 'Project: Design and Implementation of an Enterprise-Grade Web-Based Electronic Medical Records and Clinic Management System (Medipulse)',
          italics: true,
          size: 22,
          color: slateMuted,
          font: 'Calibri'
        })
      ]
    })
  );

  // Overview Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Host Organization:', bold: true, size: 20, font: 'Calibri' })]
                })
              ]
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Al-Eman Clinic and Maternity Home (No. 19 Gulma Road, Argungu, Kebbi State)',
                      size: 20,
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Official Contacts:', bold: true, size: 20, font: 'Calibri' })]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Telephone: 08069452164 · 07066694834',
                      size: 20,
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Academic Context:', bold: true, size: 20, font: 'Calibri' })]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Master of Information Technology (MIT) Capstone Project · Copyright @ MIT Capstone Project',
                      size: 20,
                      font: 'Calibri'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { before: 200, after: 200 }, children: [] })
  );

  // Append each section
  for (const sec of CHAPTER_ONE_DATA.sections) {
    // Section Heading (1.1, 1.2, etc.)
    docChildren.push(
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
      docChildren.push(
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

    // Bullets if present
    if (sec.bullets && sec.bullets.length > 0) {
      for (const b of sec.bullets) {
        docChildren.push(
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

    // Institutional note if present
    if (sec.note) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 160 },
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
  }

  // Create Document
  const doc = new Document({
    creator: 'MIT Capstone Project Engineering Team',
    title: 'CHAPTER ONE — INTRODUCTION: Al-Eman Clinic EMR System',
    description: 'Academic Chapter 1 documentation for Al-Eman Clinic and Maternity Home EMR Management System',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'MIT Capstone Project · Al-Eman Clinic EMR System (Argungu)',
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
                    text: 'Chapter 1: Introduction | Page ',
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
                    text: ' | Copyright @ MIT Capstone Project',
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
 * Downloads the Chapter One document directly as a .docx file in the browser
 */
export async function downloadChapterOneWordDocument(): Promise<void> {
  const blob = await generateChapterOneDocxBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CHAPTER_ONE_INTRODUCTION_AL_EMAN_CLINIC_MIT_CAPSTONE.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
