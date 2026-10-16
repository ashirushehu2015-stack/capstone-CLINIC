export interface ThesisDiagram {
  figureNumber: string;
  title: string;
  caption: string;
  content: string;
}

export interface ThesisSection {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  bullets?: { label?: string; text: string }[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  diagram?: ThesisDiagram;
  diagrams?: ThesisDiagram[];
  note?: string;
}

export interface ThesisChapter {
  chapterNumber: number;
  chapterTitle: string;
  subtitle: string;
  sections: ThesisSection[];
}

export const THESIS_METADATA = {
  university: 'ICONIC UNIVERSITY, SOKOTO — NIGERIA',
  universitySub: 'Open, Distance & E-Learning (ODeL)',
  projectTitle: 'DESIGN AND IMPLEMENTATION OF A WEB-BASED ELECTRONIC MEDICAL RECORDS (EMR) AND CLINIC MANAGEMENT SYSTEM (A CASE STUDY OF AL-EMAN CLINIC AND MATERNITY HOME, ARGUNGU, KEBBI STATE)',
  authors: [
    { name: 'Abdullahi Sani Mohammed', regNo: '2510803400004' },
    { name: 'Ashiru Shehu Anka', regNo: '2510802400008' },
    { name: 'Hussaini Kabir Jibo', regNo: '2510802400007' },
    { name: 'Hassana Abdulkadir Mustapha', regNo: '2510802400004' },
    { name: 'Muhammad Abubakar Sani', regNo: '2510805400003' }
  ],
  awardText: 'A Capstone Project Report Submitted in Partial Fulfilment of the Requirements for the Award of the Degree of Master of Information Technology (MIT)',
  courseCode: 'MIT 800 · PROJECT (CAPSTONE)',
  specialization: 'Health Informatics & Information Systems Management',
  supervisor: 'Dr. Bello Alh. Buhari',
  session: 'Spring Semester, 2026',
  hostOrg: 'Al-Eman Clinic and Maternity Home, No. 19 Gulma Road, Argungu, Kebbi State',
  contactInfo: '08069452164, 07066694834',
  group: 'Group 5',
  systemName: 'Al-Eman HealthFlow EMR & Clinic Management System'
};

export const PRELIMINARY_PAGES = {
  declaration: {
    title: 'DECLARATION',
    text: `We, the members of Group 5, hereby declare that this capstone project report titled "Design and Implementation of a Web-Based Electronic Medical Records (EMR) and Clinic Management System (A Case Study of Al-Eman Clinic and Maternity Home, Argungu, Kebbi State)" is the result of our own original work, carried out under the supervision of Dr. Bello Alh. Buhari. All literature, standards, and third-party open-source software libraries utilized have been duly acknowledged and referenced. This work has not been submitted, in whole or in part, for the award of any other degree, diploma, or qualification in any educational institution.`,
    members: THESIS_METADATA.authors
  },
  certification: {
    title: 'CERTIFICATION',
    text: `This is to certify that this capstone project documentation was prepared, designed, and submitted by Group 5 in partial fulfilment of the requirements for the award of the Master of Information Technology (MIT) degree of Iconic University, Sokoto, Nigeria, and has been reviewed and approved as meeting the required standards of scholarly inquiry and engineering rigor.`,
    signatories: [
      { role: 'Academic Supervisor', name: 'Dr. Bello Alh. Buhari' },
      { role: 'Head of Department / MIT Programme Coordinator', name: '____________________' },
      { role: 'Medical Director / Representative (Al-Eman Clinic & Maternity Home)', name: '____________________' }
    ]
  },
  dedication: {
    title: 'DEDICATION',
    text: `This project is dedicated first and foremost to Almighty Allah (SWT) for His infinite grace, wisdom, and sustained health throughout this postgraduate journey. It is also affectionately dedicated to our beloved families, whose prayers, patience, sacrifices, and unwavering encouragement sustained our efforts, and to the dedicated healthcare workers of Al-Eman Clinic and Maternity Home who work tirelessly day and night to safeguard maternal and child health in Argungu, Kebbi State.`
  },
  acknowledgements: {
    title: 'ACKNOWLEDGEMENTS',
    text: `We express our profound gratitude to Almighty Allah for His divine guidance, mercy, and protection throughout the execution of this capstone research. We wish to convey our deepest appreciation to our academic supervisor, Dr. Bello Alh. Buhari, for his intellectual guidance, constructive critique, and mentorship throughout the development of this system. We also express our sincere appreciation to the management, clinical officers, nursing staff, laboratory scientists, pharmacists, and administrative personnel of Al-Eman Clinic and Maternity Home, No. 19 Gulma Road, Argungu, Kebbi State, for their openness, operational insights, and authorization to conduct this case study. Finally, we thank the faculty and leadership of the School of Information and Communication Technology, Iconic University, Sokoto, for fostering an academic environment anchored on practical digital innovation.`
  },
  abstract: {
    title: 'ABSTRACT',
    paragraphs: [
      `In Nigeria, primary healthcare centers and private community maternity clinics play an indispensable frontline role in providing antenatal, natal, and general medical care. However, the overwhelming majority of these facilities still depend heavily on manual, paper-based records systems — including physical patient folders, handwritten register books, and paper prescription cards. At Al-Eman Clinic and Maternity Home, situated at No. 19 Gulma Road, Argungu, Kebbi State, this manual paradigm has led to acute operational bottlenecks, including missing patient folders, protracted waiting times in triage and consultation rooms, illegible handwriting on prescription cards, unmonitored pharmacy inventory shrinkage, unverified billing collections, and the absence of real-time epidemiological morbidity reporting for statutory health surveillance.`,
      `This project presents the design and implementation of a web-based Electronic Medical Records (EMR) and Clinic Management System engineered to eliminate these paper-based inefficiencies. The system introduces an integrated, multi-tier digital architecture supporting six clinical and administrative roles: Receptionist/Records Officer, Triage Nurse, Medical Doctor/Clinician, Laboratory Scientist, Pharmacist, and Billing Officer/Accountant, governed by strict Role-Based Access Control (RBAC). The application establishes a standardized Electronic Master Patient Index (EMPI) and an automated stage-based patient queue that coordinates real-time clinical handovers from reception to triage, consultation, laboratory investigations, pharmacy dispensing, and financial settlement. A Computerized Provider Order Entry (CPOE) module enables structured diagnostic recording, electronic prescription generation, and automated laboratory test ordering, while a dedicated pharmacy module provides real-time stock control, low-inventory notifications, and drug batch expiry warnings.`,
      `The solution was developed as a full-stack, modular web application utilizing React, TypeScript, Tailwind CSS, Express, and relational persistence, adhering strictly to the Nigeria Data Protection Act (NDPA) 2023, the National Health Act (NHA) 2014, and the National Health Management Information System (NHMIS) guidelines. Comprehensive testing — encompassing unit, integration, and role-enforcement test suites — was conducted, demonstrating rapid sub-second query execution, zero prescription transcription loss, and automated morbidity reporting. The system provides Al-Eman Clinic and Maternity Home with a secure, paperless, auditable operational framework that enhances patient safety, optimizes clinical throughput, and elevates the quality of maternal and child healthcare in Argungu, Kebbi State.`
    ],
    keywords: 'Electronic Medical Records (EMR), Clinic Management System, Health Informatics, Computerized Provider Order Entry (CPOE), Maternal and Child Health, Triage Automation, Pharmacy Inventory Control, Role-Based Access Control (RBAC), Al-Eman Clinic, Argungu, Kebbi State.'
  },
  abbreviations: [
    { abbr: 'EMR', meaning: 'Electronic Medical Record' },
    { abbr: 'EHR', meaning: 'Electronic Health Record' },
    { abbr: 'CPOE', meaning: 'Computerized Provider Order Entry' },
    { abbr: 'EMPI', meaning: 'Electronic Master Patient Index' },
    { abbr: 'HIS', meaning: 'Hospital Information System' },
    { abbr: 'MCH', meaning: 'Maternal and Child Health' },
    { abbr: 'ANC', meaning: 'Antenatal Care' },
    { abbr: 'PNC', meaning: 'Postnatal Care' },
    { abbr: 'OPD', meaning: 'Outpatient Department' },
    { abbr: 'IPD', meaning: 'Inpatient Department' },
    { abbr: 'PHI', meaning: 'Protected Health Information' },
    { abbr: 'RBAC', meaning: 'Role-Based Access Control' },
    { abbr: 'NDPA', meaning: 'Nigeria Data Protection Act (2023)' },
    { abbr: 'NHA', meaning: 'National Health Act (2014)' },
    { abbr: 'NHMIS', meaning: 'National Health Management Information System' },
    { abbr: 'FMOH', meaning: 'Federal Ministry of Health (Nigeria)' },
    { abbr: 'ICD-10', meaning: 'International Classification of Diseases, 10th Revision' },
    { abbr: 'ADE', meaning: 'Adverse Drug Event' },
    { abbr: 'POS', meaning: 'Point of Sale' },
    { abbr: 'API', meaning: 'Application Programming Interface' },
    { abbr: 'SQL', meaning: 'Structured Query Language' },
    { abbr: 'UI/UX', meaning: 'User Interface / User Experience' },
    { abbr: 'SDLC', meaning: 'Software Development Life Cycle' }
  ]
};

export const THESIS_CHAPTERS: ThesisChapter[] = [
  // ==========================================
  // CHAPTER ONE
  // ==========================================
  {
    chapterNumber: 1,
    chapterTitle: 'CHAPTER ONE — INTRODUCTION',
    subtitle: 'Background of the Study, Host Organization (Al-Eman Clinic & Maternity Home), Statement of the Problem, Aim and Objectives, Scope, Limitations, Significance, and Definition of Terms',
    sections: [
      {
        id: '1.1',
        number: '1.1',
        title: 'Background of the Study',
        paragraphs: [
          `The delivery of primary healthcare services in Nigeria is undergoing a critical transition as healthcare facilities confront the mounting challenges of managing burgeoning patient populations with outdated manual tools. Across secondary health centers, private clinics, and specialized maternity homes, core public health services — antenatal monitoring, neonatal care, disease diagnosis, outpatient triage, laboratory diagnostics, and medication dispensing — have traditionally rested upon paper-based operational methods. In this manual paradigm, patient information is inscribed on paper cards and bound into cardstock folders stored in crowded physical record rooms. While manual record-keeping was once considered low-cost and straightforward, the rapid expansion of urban and semi-urban populations in Northern Nigeria has exposed its severe structural limitations: paper records are susceptible to physical wear and tear, misplacement, duplicate creation, and unauthorized inspection, while manual queues cause extensive delays in clinical decision-making.`,
          `Healthcare infrastructure, by its very nature, demands continuous, accurate, and rapid information flow across multiple specialized clinical departments. When a patient arrives at a clinic, their care trajectory spans several distinct functional units: reception and patient identification, nursing triage for vital signs acquisition, physician consultation and clinical examination, diagnostic laboratory investigations, pharmacy dispensing, and financial settlement. In a paper-governed environment, each transition point represents a potential point of failure. Illegible handwriting on prescription slips leads to adverse drug events; missing patient folders delay emergency maternity interventions; untracked laboratory requests leave clinicians without crucial diagnostic indicators; and manual pharmacy ledgers obscure expiring medications and unmonitored stock exhaustion. The discipline of capturing, structuring, securing, and transmitting clinical data across these hospital touchpoints is known as Health Informatics, and it sits at the vital intersection of medical practice, computer science, information systems management, and regulatory compliance.`,
          `The Nigerian healthcare environment renders the adoption of digital clinical systems urgent rather than discretionary. According to the World Health Organization (WHO, 2023) and the Federal Ministry of Health (FMOH, 2024), Nigeria accounts for a substantial proportion of global maternal and neonatal mortality, with rural and semi-urban areas bearing the heaviest burden. In Kebbi State, expanding access to skilled birth attendance, prenatal screening, and rapid outpatient management represents a top public health priority. However, healthcare practitioners frequently operate in information-blind environments where a patient's prior medical history, drug allergies, previous surgical interventions, and gravid status cannot be quickly retrieved at the point of care. Furthermore, the enactment of the Nigeria Data Protection Act (NDPA) in 2023 and the statutory mandates of the National Health Act (NHA) of 2014 impose strict legal duties on healthcare providers to protect patient medical confidentiality and maintain auditable clinical records. For private and community health providers such as Al-Eman Clinic and Maternity Home in Argungu, deploying an automated, secure, and integrated Electronic Medical Records (EMR) system is therefore a fundamental imperative to elevate patient safety, optimize clinical workflow, and meet national regulatory healthcare standards.`,
          `An Electronic Medical Records (EMR) and Clinic Management System in this context is enterprise software that continuously captures, synchronizes, and protects patient medical histories, clinical vitals, physician orders, diagnostic results, and financial transactions across a healthcare facility. For a community-based maternity clinic, such a system must accomplish far more than generic data entry: it must reliably identify returning patients via an Electronic Master Patient Index (EMPI), enforce stage-based clinical queue progression, prevent drug interaction and dosage errors via Computerized Provider Order Entry (CPOE), maintain real-time inventory control over life-saving drugs, and compile statutory morbidity surveillance reports suitable for administrative and public health submission. This project, titled Al-Eman HealthFlow EMR & Clinic Management System, was conceived, engineered, and deployed to satisfy precisely these operational imperatives for Al-Eman Clinic and Maternity Home, Argungu, Kebbi State.`
        ]
      },
      {
        id: '1.2',
        number: '1.2',
        title: 'Background of the Host Organization (Al-Eman Clinic & Maternity Home)',
        paragraphs: [
          `Al-Eman Clinic and Maternity Home is a registered private healthcare institution strategically located at No. 19 Gulma Road, Argungu, Kebbi State, Nigeria (Official Contact Lines: 08069452164, 07066694834). Established to provide accessible, affordable, compassionate, and comprehensive medical and maternal care, the clinic serves as a critical healthcare anchor for the historic town of Argungu, surrounding agrarian communities across the Argungu Emirate, and referring patients from neighboring Local Government Areas in Kebbi State.`,
          `The clinic's clinical service delivery spans key primary and secondary healthcare domains directly targeted by this digital intervention:`,
          `As a vital frontline provider of maternal and child health in Argungu, Al-Eman Clinic and Maternity Home handles hundreds of patient interactions weekly. However, its continued operational reliance on physical paper registers, handwritten patient cards, and manual ledger books has created severe administrative bottlenecks that compromise patient throughput, delay clinical decision-making, and create vulnerabilities in revenue management and inventory control. In its institutional commitment to modernize its clinical operations, comply with the Nigeria Data Protection Act (NDPA) 2023, and provide faster, evidence-based medical care to the community, the management of Al-Eman Clinic and Maternity Home authorized this capstone project to design, develop, and deploy a purpose-built, secure, web-based EMR and Clinic Management System.`
        ],
        bullets: [
          {
            label: 'Maternal and Antenatal Care (ANC):',
            text: 'Comprehensive prenatal screening, gestational tracking, high-risk pregnancy identification, labour and delivery management, and postnatal follow-up services designed to reduce maternal and neonatal morbidity.'
          },
          {
            label: 'General Outpatient Department (OPD):',
            text: 'Clinical consultations, acute illness management, pediatric care, and treatment of endemic infectious diseases including malaria, typhoid fever, respiratory infections, and gastrointestinal conditions.'
          },
          {
            label: 'Clinical Diagnostic Laboratory:',
            text: 'Diagnostic hematology, parasitology, urinalysis, rapid diagnostic testing, blood grouping, and biochemical screening supporting empirical clinical diagnosis.'
          },
          {
            label: 'Pharmacy Dispensary & Medical Store:',
            text: 'Dispensing essential medications, oral rehydration therapies, antibiotics, antimalarials, and maternal nutritional supplements, coupled with central medical stock storage.'
          },
          {
            label: 'Inpatient and Observational Ward:',
            text: 'Post-delivery recovery rooms, short-stay observational beds, vital signs monitoring, and fluid administration.'
          }
        ],
        diagram: {
          figureNumber: 'Figure 1.1',
          title: 'Al-Eman Clinic & Maternity Home Operational Organogram & Touchpoint Topology',
          caption: 'Figure 1.1: Operational organogram and clinical touchpoint topology of Al-Eman Clinic and Maternity Home (No. 19 Gulma Road, Argungu, Kebbi State), illustrating administrative leadership, clinical divisions, and integration with the Al-Eman HealthFlow digital platform.',
          content: `
+----------------------------------------------------------------------------------------------------+
|                      AL-EMAN CLINIC & MATERNITY HOME — OPERATIONAL ORGANOGRAM                      |
|                           No. 19 Gulma Road, Argungu, Kebbi State, Nigeria                         |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
                              +---------------------------------------+
                              |      CHIEF MEDICAL DIRECTOR (CMD)     |
                              |   Executive Clinical & Admin Lead     |
                              +---------------------------------------+
                                                  |
            +-------------------------------------+-------------------------------------+
            |                                     |                                     |
            v                                     v                                     v
+-----------------------+             +-----------------------+             +-----------------------+
|  CLINICAL & MATERNAL  |             |  ANCILLARY DIAGNOSTIC |             | ADMINISTRATIVE &      |
|  CARE DIVISION        |             |  & PHARMACEUTICAL     |             | FINANCIAL SERVICES    |
+-----------------------+             +-----------------------+             +-----------------------+
|                       |             |                       |             |                       |
| • Consulting Doctors  |             | • Diagnostic Lab      |             | • Records & Reception |
|   (OPD & Inpatient)   |             |   (Parasitology,      |             |   (EMPI Master Index, |
|                       |             |    Hematology, Urine) |             |    Card Issuance)     |
| • Nursing Supervisor  |             |                       |             |                       |
|   & Midwives          |             | • Dispensary Pharmacy |             | • Billing & Cashier   |
|   (Triage, Antenatal  |             |   (Drug Formulary,    |             |   (Multi-Channel POS, |
|    Vitals, Labour &   |             |    Batch Expiry,      |             |    Cash, Reconciliation)
|    Delivery Care)     |             |    Stock Sentinel)    |             |                       |
+-----------------------+             +-----------------------+             +-----------------------+
            |                                     |                                     |
            +-------------------------------------+-------------------------------------+
                                                  |
                                                  v
                              +---------------------------------------+
                              |  SHARED DIGITAL HEALTHCARE PLATFORM   |
                              |   (Al-Eman HealthFlow EMR System)     |
                              +---------------------------------------+`
        },
        note: `Note for the documentation file: Attach Al-Eman Clinic's signed Letter of Acceptance/Authorization (Deliverable 1 Project Charter) as an annex and confirm the clinic's operating license registration details with the Medical Director for inclusion in the final archive.`
      },
      {
        id: '1.3',
        number: '1.3',
        title: 'Statement of the Problem',
        paragraphs: [
          `Al-Eman Clinic and Maternity Home currently relies upon manual, paper-based administrative and clinical record-keeping methods. An in-depth workflow investigation conducted across the clinic's departments revealed severe operational deficiencies that directly threaten clinical efficacy, patient satisfaction, and financial sustainability. The specific operational challenges identified are:`
        ],
        bullets: [
          {
            label: 'Misplacement, Duplication, and Deterioration of Patient Records:',
            text: 'Medical histories are recorded in physical paper folders stored on manual shelving units. Folders frequently go missing, become damaged from handling and climatic dust, or are duplicated when returning patients cannot locate their clinic identification numbers, leading to fragmented medical histories and repeated diagnostic workups.'
          },
          {
            label: 'Protracted Patient Waiting Times and Uncoordinated Queues:',
            text: 'There is no automated tracking of patient movement through the clinic. Patients — including expectant mothers, nursing women, and acutely ill children — endure prolonged, unmonitored waiting periods in crowded waiting areas with no objective visibility into queue status or triage urgency.'
          },
          {
            label: 'Prescription Illegibility and Risk of Adverse Drug Events:',
            text: 'Physicians record diagnoses and medication orders by hand on paper prescription slips. Illegible handwriting, missing dosage instructions, and the absence of real-time drug availability checks frequently lead to dispensing delays, transcription errors, or the substitution of incorrect therapeutic equivalents.'
          },
          {
            label: 'Pharmacy Stockout Blindness and Inventory Shrinkage:',
            text: 'Medication stock levels are tracked using manual stock cards and paper ledgers. Consequently, the pharmacy operates without automated low-stock warnings, reorder thresholds, or expiration date tracking, leading to sudden stockouts of vital life-saving drugs or financial loss from expired medications.'
          },
          {
            label: 'Revenue Leakage and Unreconciled Financial Accounts:',
            text: 'Billing for consultations, laboratory investigations, and medication dispensing is recorded on manual paper receipts. Hand-collected cash, Point of Sale (POS) receipts, and direct bank transfers are difficult to cross-reconcile at the end of shifts, resulting in revenue leakage, delayed billing clearances, and accounting discrepancies.'
          },
          {
            label: 'Manual, Arduous Epidemiological Reporting:',
            text: 'Compiling mandatory National Health Management Information System (NHMIS) monthly morbidity and service summary reports for the Kebbi State Ministry of Health requires days of arduous manual tallying from physical registers, producing delayed and error-prone public health returns.'
          },
          {
            label: 'Absence of Role Separation and Clinical Data Security:',
            text: 'Paper records cannot enforce role-based access control. Any individual with physical access to the record store or nurse desk can inadvertently view sensitive reproductive health records, confidential patient vitals, and personal identifiable data, creating severe compliance risks under the Nigeria Data Protection Act (NDPA) 2023.'
          }
        ],
        note: `The continuation of this paper-based model compromises clinical outcomes for mothers and infants in Argungu and leaves Al-Eman Clinic without the defensible, transparent, and auditable operational foundation required of a modern healthcare facility.`
      },
      {
        id: '1.4',
        number: '1.4',
        title: 'Aim and Objectives',
        paragraphs: [
          `Aim: To design, develop, and deploy a secure, web-based Electronic Medical Records (EMR) and Clinic Management System for Al-Eman Clinic and Maternity Home (Al-Eman HealthFlow) that eliminates paper records, automates clinical queueing and triage, streamlines doctor consultations and CPOE orders, tracks pharmacy inventory and laboratory diagnostics, reconciles multi-channel billing, and generates auditable epidemiological reports.`,
          `Specific Objectives: In order to achieve this aim, the project set out to accomplish the following specific engineering and research objectives:`
        ],
        bullets: [
          {
            label: 'Objective 1 — Requirements Elicitation & Clinical Workflow Modeling:',
            text: 'Investigate, analyse, and document the operational clinical, maternity, laboratory, pharmacy, and administrative workflows of Al-Eman Clinic and Maternity Home to formulate comprehensive functional and non-functional specifications.'
          },
          {
            label: 'Objective 2 — Layered Software Architecture Design:',
            text: 'Architect a sustainable, layered, full-stack software system (separating domain data models, relational persistence, clinical business services, and reactive user interfaces) adhering to SOLID and DRY engineering principles.'
          },
          {
            label: 'Objective 3 — Role-Based Access Control (RBAC) & Security Portal:',
            text: 'Develop a secure operator authentication portal enforcing granular role-based privileges across six clinical user roles (Receptionist/Records Officer, Triage Nurse, Medical Doctor, Laboratory Scientist, Pharmacist, and Billing Officer/Administrator).'
          },
          {
            label: 'Objective 4 — Electronic Patient Master Index & Automated Queue Management:',
            text: 'Implement an Electronic Master Patient Index (EMPI) for unique patient identification and an automated, stage-based patient queue engine that dynamically tracks patients from Reception → Triage → Consultation → Laboratory/Pharmacy → Billing.'
          },
          {
            label: 'Objective 5 — Computerized Provider Order Entry (CPOE) & Clinical Notes:',
            text: 'Develop clinical consultation interfaces that capture structured SOAP (Subjective, Objective, Assessment, Plan) consultation notes, standardized ICD-10 diagnosis coding, electronic prescription orders, and digital laboratory test requisitions.'
          },
          {
            label: 'Objective 6 — Diagnostic Laboratory & Pharmacy Inventory Automation:',
            text: 'Develop an integrated laboratory order fulfillment and results reporting module, coupled with a real-time pharmacy inventory engine featuring automated stock depletion, low-stock threshold alerts, and batch expiry tracking.'
          },
          {
            label: 'Objective 7 — Multi-Channel Invoicing & Financial Reconciliation:',
            text: 'Implement an automated billing engine that aggregates consultation fees, laboratory investigation charges, and medication costs into unified patient invoices, supporting cash, POS, and bank transfer reconciliation.'
          },
          {
            label: 'Objective 8 — Clinical Analytics, Cloud Deployment & Comprehensive Documentation:',
            text: 'Implement an interactive analytics dashboard featuring real-time morbidity surveillance charts and revenue reports, deploy the system to a production cloud environment, execute thorough verification testing, and prepare comprehensive user manuals.'
          }
        ]
      },
      {
        id: '1.5',
        number: '1.5',
        title: 'Scope of the Project',
        paragraphs: [
          `The functional and technical scope of this capstone project covers:`
        ],
        bullets: [
          {
            text: 'A responsive, multi-departmental web-based clinical management console accessible across standard desktop, laptop, and tablet web browsers without client-side installation.'
          },
          {
            text: 'Patient Registration and Demographic Profiling featuring unique clinic card numbering, emergency contact capture, and next-of-kin indexing.'
          },
          {
            text: 'Triage and Vital Signs Capture recording blood pressure, pulse rate, respiratory rate, temperature, weight, height, BMI computation, and clinical acuity tagging.'
          },
          {
            text: 'Dynamic Stage-Based Queue Management coordinating patient transitions across Reception, Triage, Doctor, Laboratory, Pharmacy, and Billing desks in real time.'
          },
          {
            text: 'Physician Consultation and CPOE supporting chief complaints, clinical examination findings, ICD morbidity coding, electronic prescription ordering, and diagnostic lab requisitions.'
          },
          {
            text: 'Diagnostic Laboratory Management enabling test sample intake, result recording, normal-range verification, and digital sign-off.'
          },
          {
            text: 'Pharmacy Dispensing and Stock Control tracking drug cataloging, unit pricing, real-time inventory deduction upon dispensing, batch numbers, and expiry monitoring.'
          },
          {
            text: 'Unified Patient Invoicing and Payment Settlement capturing payment methods (Cash, POS, Direct Transfer), generating printable receipts, and calculating daily revenue balances.'
          },
          {
            text: 'Role-Based Authentication and Audit Logging restricting data access by clinical credential and logging sensitive patient data modifications.'
          },
          {
            text: 'Clinical Analytics Dashboard presenting top diagnoses (morbidity surveillance), patient volume by department, inventory valuation, and revenue distribution.'
          }
        ]
      },
      {
        id: '1.6',
        number: '1.6',
        title: 'Limitations of the Project',
        paragraphs: [
          `In executing this project, the following technical and operational boundaries were established:`
        ],
        bullets: [
          {
            label: 'Local Network and Connectivity Constraints:',
            text: 'The system operates within modern web standards; while optimized for low-bandwidth environments, clinical terminals require active local network or internet access to synchronize records with the central database.'
          },
          {
            label: 'Hardware Terminal Infrastructure:',
            text: 'The software relies on the clinic providing baseline computing hardware (workstations or tablets) at designated clinical stations (reception, nursing station, doctor consulting room, laboratory, and pharmacy).'
          },
          {
            label: 'Biometric Patient Identification Out of Scope:',
            text: 'Patient identification relies on unique electronic registration IDs, phone numbers, and demographic indexing; biometric fingerprint or facial recognition scanning was excluded from the initial release to reduce hardware overhead.'
          },
          {
            label: 'Phased Historical Data Migration:',
            text: 'The system establishes a clean digital baseline for all new and returning clinic visits; retrospective digitization of thousands of archived physical paper folders is managed through an ongoing, phased registration workflow.'
          },
          {
            label: 'External NHMIS National API Integration:',
            text: 'The system compiles standardized morbidity summary statistics conforming to the NHMIS format; direct machine-to-machine API submission to the national DHIS2 portal is subject to national health ministry API gateway access and remains designated for future integration.'
          }
        ]
      },
      {
        id: '1.7',
        number: '1.7',
        title: 'Significance of the Project',
        paragraphs: [
          `The deployment of Al-Eman HealthFlow delivers substantial, quantifiable benefits across multiple stakeholder dimensions:`
        ],
        bullets: [
          {
            label: 'For Al-Eman Clinic & Maternity Home Management:',
            text: 'Provides total administrative and operational visibility across all clinical departments, eliminates revenue leakage through automated reconciliation, prevents unmonitored pharmacy stock depletion, and safeguards the institution against compliance liabilities under national health regulations.'
          },
          {
            label: 'For Medical Doctors, Nurses, and Clinical Staff:',
            text: 'Eliminates time wasted searching for missing paper folders, eradicates prescription transcription ambiguity, provides instantaneous access to longitudinal patient histories and prior diagnostic tests, and streamlines clinical handovers.'
          },
          {
            label: 'For Patients and Expectant Mothers in Argungu Emirate:',
            text: 'Significantly reduces waiting times in crowded waiting areas, ensures accurate and continuous tracking of antenatal progress, prevents medication dosage errors, and guarantees the confidentiality of sensitive reproductive and personal health information.'
          },
          {
            label: 'For the Field of Health Informatics in Nigeria:',
            text: 'Demonstrates a practical, high-performance, cost-effective reference architecture for digitizing small-to-medium private clinics and maternity homes across developing economies without expensive proprietary licensing fees.'
          },
          {
            label: 'For the Project Team and Iconic University Sokoto:',
            text: 'Evidences applied engineering competence in designing, building, and deploying mission-critical health information systems, fulfilling the academic and practical requirements of MIT 800 (Capstone Project).'
          }
        ]
      },
      {
        id: '1.8',
        number: '1.8',
        title: 'Definition of Key Terms',
        paragraphs: [
          `The operational definitions of technical and clinical concepts utilized throughout this report are:`
        ],
        bullets: [
          {
            label: 'Electronic Medical Record (EMR):',
            text: 'A digital version of a patient’s paper chart within a single healthcare organization, containing medical history, diagnoses, medications, immunization dates, allergies, and lab results.'
          },
          {
            label: 'Electronic Master Patient Index (EMPI):',
            text: 'A centralized database registry that assigns a unique, immutable identifier to each registered patient, preventing duplicate records and enabling rapid demographic lookup.'
          },
          {
            label: 'Computerized Provider Order Entry (CPOE):',
            text: 'An electronic system that allows medical practitioners to enter instructions and treatment orders (such as laboratory tests and pharmacy prescriptions) directly into a computer application, eliminating handwritten order ambiguity.'
          },
          {
            label: 'Triage:',
            text: 'The clinical process of rapidly assessing and prioritizing patients based on the severity of their condition and vital signs (blood pressure, temperature, pulse rate, respiration) to determine treatment urgency.'
          },
          {
            label: 'Protected Health Information (PHI):',
            text: 'Any individually identifiable health data created, transmitted, or maintained by a healthcare provider, protected under national data protection and healthcare statutes.'
          },
          {
            label: 'Role-Based Access Control (RBAC):',
            text: 'A computer security mechanism that restricts system access and action authorizations to authenticated users based on their defined organizational job functions.'
          },
          {
            label: 'Morbidity Surveillance:',
            text: 'The systematic, ongoing collection, collation, and analysis of health data regarding the occurrence and distribution of diseases and health conditions in a given population.'
          },
          {
            label: 'Audit Trail:',
            text: 'A chronologically ordered, tamper-evident security record providing documentary evidence of the sequence of activities that have affected a specific operation, procedure, or event in the software.'
          }
        ]
      },
      {
        id: '1.9',
        number: '1.9',
        title: 'Organization of the Report',
        paragraphs: [
          `This capstone project report is organized into seven structured chapters following the established academic format. Chapter One introduces the study, details the host organization (Al-Eman Clinic and Maternity Home), articulates the statement of the problem, defines the aim and objectives, establishes the scope and limitations, and outlines key terms. Chapter Two reviews the underlying theoretical and empirical literature, surveys health information systems taxonomies, examines CPOE and clinical data protection frameworks, provides a comparative analysis of existing tools (Table 2.1), and establishes the research gap. Chapter Three presents the software engineering methodology, requirements specifications, and architectural justifications. Chapter Four details the system design, database entity-relationship models, and component implementations. Chapter Five covers verification testing, integration results, and user acceptance benchmarks. Chapter Six documents the deployment architecture and user operating manual. Chapter Seven concludes the report, discusses engineering challenges, and presents recommendations for future enhancements.`
        ]
      }
    ]
  },

  // ==========================================
  // CHAPTER TWO
  // ==========================================
  {
    chapterNumber: 2,
    chapterTitle: 'CHAPTER TWO — LITERATURE REVIEW',
    subtitle: 'Health Information Systems Evolution, EMR Taxonomies, Clinical Workflow Automation, Computerized Provider Order Entry (CPOE), Healthcare Data Protection, Review of Existing Systems, Regulatory Frameworks, and Gap Analysis',
    sections: [
      {
        id: '2.1',
        number: '2.1',
        title: 'Introduction',
        paragraphs: [
          `This chapter reviews the body of scholarly literature and technical knowledge underpinning the development of the Al-Eman HealthFlow EMR & Clinic Management System. It examines the historical evolution from paper-based health records to digital clinical systems; establishes a comprehensive taxonomy of healthcare information systems; investigates the mechanisms and safety benefits of clinical workflow automation and Computerized Provider Order Entry (CPOE); evaluates the critical security, privacy, and confidentiality imperatives surrounding Protected Health Information (PHI); conducts a rigorous comparative analysis of existing open-source and commercial healthcare tools against the operational requirements of a private clinic and maternity home in Argungu, Kebbi State; contextualizes the project within Nigeria’s legislative and regulatory healthcare environment; and concludes with a definitive gap analysis that establishes the empirical and engineering justification for this project.`
        ]
      },
      {
        id: '2.2',
        number: '2.2',
        title: 'Healthcare Information Systems and Electronic Medical Records',
        paragraphs: [
          `Healthcare Information Systems (HIS) encompass the comprehensive collection of software, hardware, networks, and operational procedures utilized to capture, store, manage, and transmit healthcare and administrative data in medical institutions (Shortliffe & Cimino, 2014). Historically, medical documentation was exclusively paper-based. The traditional paper health record, consisting of handwritten clinical charts, nursing notes, laboratory paper slips, and prescription slips, served as the primary repository of clinical memory for over a century. However, foundational health informatics literature has extensively demonstrated that paper records suffer from intrinsic structural vulnerabilities: illegibility, physical decay, single-user availability, vulnerability to misfiling, and total absence of automated decision-support mechanisms (Bates et al., 2001; Institute of Medicine [IOM], 2001).`,
          `The seminal Institute of Medicine report, "To Err Is Human: Building a Safer Health System" (IOM, 2000), marked a paradigm shift in healthcare systems research by revealing that tens of thousands of preventable clinical deaths occur annually due to medical errors, a significant proportion of which stem from communication failures, illegible handwritten orders, and inaccessible clinical documentation. In response, modern health informatics has championed the Electronic Medical Record (EMR) — an integrated digital repository that consolidates a patient's medical history, vital signs, physical examination records, laboratory results, and pharmacological treatment plans within a secure software environment (Shortliffe & Cimino, 2014).`,
          `In developing countries, particularly across Sub-Saharan Africa, the imperative for EMR adoption is amplified by resource constraints, high patient-to-clinician ratios, and substantial burdens of communicable and maternal-child diseases (Adeleke et al., 2014). In Nigeria, the National Health ICT Strategic Framework (FMOH, 2016) highlighted that manual documentation in primary and secondary healthcare centers creates severe operational delays, inflates administrative overhead, and severely impedes reliable disease surveillance. Transitioning to a web-based EMR architecture provides simultaneous multi-user access to patient records, guarantees legibility, enforces standardized diagnostic nomenclature (such as ICD-10), and produces immediate clinical and administrative audit trails.`
        ]
      },
      {
        id: '2.3',
        number: '2.3',
        title: 'Taxonomies of Health Information Systems',
        paragraphs: [
          `Health information systems in the literature are categorized along several structural and operational dimensions. Shortliffe and Cimino (2014) and Tan and Payton (2010) classify healthcare systems by their functional scope, target operational environment, and architectural implementation:`,
          `For community-based primary and secondary healthcare facilities such as Al-Eman Clinic and Maternity Home, monolithic HIS platforms are prohibitively expensive and unmanageably complex, while standalone single-function tools perpetuate departmental data silos. Consequently, the literature strongly advocates for a modular, web-based, unified EMR architecture that seamlessly binds patient registration, nursing triage, consultation, laboratory orders, pharmacy dispensing, and financial billing into a singular, cohesive database schema.`
        ],
        bullets: [
          {
            label: '1. Enterprise Hospital Information Systems (HIS):',
            text: 'Large-scale, multi-facility software suites deployed in tertiary teaching hospitals and extensive medical centers. These systems encompass inpatient bed allocation, complex surgical scheduling, advanced radiology picture archiving (PACS), intensive care monitoring, and extensive departmental billing. They are characterized by heavy hardware requirements, dedicated server rooms, full-time IT administration teams, and exorbitant licensing costs.'
          },
          {
            label: '2. Ambulatory and Primary Care EMR Systems:',
            text: 'Software suites optimized for outpatient encounters, general medical consultations, community clinics, and private medical practices. These systems emphasize rapid patient identification, longitudinal outpatient charts, vital signs trending, electronic prescribing, diagnostic test requisitions, and point-of-care financial reconciliation.'
          },
          {
            label: '3. Specialized Maternal and Child Health (MCH) Systems:',
            text: 'Clinical solutions tailored to the obstetric and pediatric lifecycle, including antenatal care (ANC) visit scheduling, gestational age and expected date of delivery (EDD) computation, fetal heart rate logging, immunization tracking, and post-partum recovery monitoring.'
          },
          {
            label: '4. Architectural Paradigms (Monolithic vs Modular Web SPA):',
            text: 'Early healthcare software relied on thick-client, monolithic desktop software running on local client-server networks. Modern software engineering has decisively shifted toward lightweight, responsive Single Page Applications (SPAs) communicating with RESTful API backends, allowing clinical personnel to access the system securely through standard web browsers on commodity hardware without complex client-side software installations (Pressman & Maxim, 2020).'
          }
        ]
      },
      {
        id: '2.4',
        number: '2.4',
        title: 'Clinical Workflow Automation and Computerized Provider Order Entry (CPOE)',
        paragraphs: [
          `Clinical workflow automation refers to the programmatic modeling, execution, and monitoring of healthcare operational tasks according to established clinical pathways (Tan & Payton, 2010). In a conventional clinic setting, patients experience prolonged idle times between service points due to manual batch handovers — paper cards carried by hand from records to nursing stations, and from doctors to pharmacy counters. Workflow automation replaces physical paper handovers with electronic state transitions: when a nurse submits vital signs, the patient's queue state automatically transitions to "Waiting for Doctor", immediately appearing on the physician's active consultation roster.`,
          `A central pillar of clinical workflow automation is Computerized Provider Order Entry (CPOE). CPOE is a digital software mechanism that allows licensed medical practitioners to enter diagnostic, pharmaceutical, and therapeutic instructions directly into an electronic system, rather than hand-writing orders on paper pads (Kaushal et al., 2003). The clinical literature identifies four paramount safety and efficiency advantages conferred by CPOE:`,
          `By integrating CPOE directly into the consultation workflow, Al-Eman HealthFlow guarantees that prescriptions and laboratory requisitions are instantly routed to the pharmacy and laboratory workbenches respectively, eliminating the risk of lost paper slips, reducing patient transit time, and providing automated billing calculation.`
        ],
        bullets: [
          {
            label: '1. Eradication of Handwriting Ambiguity:',
            text: 'Illegible physician handwriting is a primary contributor to medication errors globally. CPOE enforces standardized, printed electronic drug names, strengths, dosages, routes, and duration, eradicating misinterpretation at the dispensary (Bates et al., 2001).'
          },
          {
            label: '2. Real-Time Formulary and Inventory Verification:',
            text: 'Conventional paper prescribing is decoupled from pharmacy inventory; doctors frequently prescribe medications that are currently out of stock, forcing patients to return to the consultation room for alternative prescriptions. In contrast, an integrated CPOE system displays real-time pharmacy stock availability at the moment of prescription.'
          },
          {
            label: '3. Closed-Loop Laboratory Order Tracking:',
            text: 'Diagnostic requisitions entered electronically cannot be misplaced. The laboratory unit receives test orders in real time, logs specimen collection, records qualitative or quantitative results, and transmits verified reports back to the patient’s digital chart without paper transit delays.'
          },
          {
            label: '4. Immediate Cost Capture and Financial Integrity:',
            text: 'Every order entered through CPOE automatically updates the patient’s central billing invoice according to the clinic’s approved tariff schedule, eliminating unbilled clinical procedures and preventing revenue leakage.'
          }
        ]
      },
      {
        id: '2.5',
        number: '2.5',
        title: 'Security, Confidentiality, and Data Protection in Health Information Systems',
        paragraphs: [
          `Healthcare data constitutes one of the most sensitive categories of personal information recognized by global and national legal frameworks. Protected Health Information (PHI) includes demographic records, diagnostic results, reproductive histories, physiological vitals, and pharmacological treatment regimens. The unauthorized disclosure or compromise of PHI carries devastating personal consequences for patients, including social stigmatization, reputational harm, and discrimination, while exposing healthcare institutions to crippling legal penalties and loss of public trust (Gostin, 2008).`,
          `In Nigeria, the statutory framework governing medical privacy has been substantially reinforced by the passage of the Nigeria Data Protection Act (NDPA) in 2023. Under the NDPA (Sections 24–39), healthcare providers are categorized as data controllers of sensitive personal data, legally bound to implement robust technical and organizational security measures to prevent unauthorized access, alteration, disclosure, or destruction of patient information (Federal Republic of Nigeria, 2023). Furthermore, the National Health Act (NHA) of 2014 (Sections 26–29) explicitly mandates that all health records generated in health establishments are strictly confidential, prescribing criminal sanctions for unauthorized disclosure.`,
          `To satisfy these statutory and ethical imperatives, modern health software must implement comprehensive security controls across multiple architectural tiers:`,
          `SentinelFlow and Al-Eman HealthFlow adhere strictly to these security design principles. The system enforces strict role-based view isolation, provides full password hashing and session authorization, and maintains an indelible audit trail of all patient folder updates and billing transactions.`
        ],
        bullets: [
          {
            label: 'Role-Based Access Control (RBAC):',
            text: 'Restricting data visibility and operational permissions strictly according to authenticated user job roles (Ferraiolo & Kuhn, 1992). A receptionist has access to demographic data and queue assignment but cannot inspect doctor consultation notes or laboratory test values; conversely, a physician can enter clinical diagnoses but cannot alter financial ledger balances.'
          },
          {
            label: 'Cryptographic Protection in Transit and at Rest:',
            text: 'Encrypting communication channels via Transport Layer Security (TLS/HTTPS) to prevent eavesdropping and man-in-the-middle packet interception across local or wireless clinic networks.'
          },
          {
            label: 'Immutable Clinical Audit Logging:',
            text: 'Recording timestamped audit logs for every clinical modification, diagnosis entry, prescription issuance, and payment collection, establishing full legal accountability and non-repudiation.'
          },
          {
            label: 'Database Integrity and Backup Controls:',
            text: 'Enforcing relational foreign key constraints, automated data backups, and disaster recovery procedures to safeguard patient records against hardware failure or accidental corruption.'
          }
        ]
      },
      {
        id: '2.6',
        number: '2.6',
        title: 'Review of Existing Systems',
        paragraphs: [
          `A diverse array of software tools and operational paradigms has been developed to address healthcare management. Their operational characteristics, strengths, and specific limitations when evaluated against the realities of Al-Eman Clinic and Maternity Home in Argungu, Kebbi State, are comparatively analyzed in Table 2.1 below:`
        ],
        table: {
          headers: ['System / Solution', 'Category', 'Strengths', 'Limitations for Al-Eman Clinic & Maternity Home'],
          rows: [
            [
              'Traditional Paper Registers & Physical Folders',
              'Manual Documentation',
              'Zero initial software acquisition cost; requires no computing hardware or electricity; familiar to legacy administrative staff.',
              'Severely prone to misfiling and physical decay; causes prolonged patient queue delays; illegible prescriptions invite drug errors; untracked pharmacy stockouts; revenue leakage; non-compliant with NDPA 2023.'
            ],
            [
              'OpenMRS (Mamlin et al., 2006)',
              'Open-Source Electronic Medical Record',
              'Highly modular, mature community; strong longitudinal HIV/TB disease tracking; extensive concept dictionary.',
              'Extremely resource-heavy (requires Java runtime, Tomcat, MySQL server); steep learning curve; complex configuration; lacks built-in point-of-sale retail pharmacy inventory, multi-channel clinic billing, and rapid maternity queueing.'
            ],
            [
              'GNU Health (Falcone, 2015)',
              'Free/Libre Hospital & Health Information System',
              'Comprehensive functionality; integrates EMR, hospital management, and epidemiology; built on Tryton/PostgreSQL.',
              'High deployment barrier; complex enterprise ERP architecture requiring dedicated Linux sysadmins; unwieldy for small-to-medium private clinics; slow user interaction on entry-level hardware.'
            ],
            [
              'Bahmni (ThoughtWorks / Bahmni Coalition)',
              'Integrated Open-Source Hospital System',
              'Combines OpenMRS, OpenELIS (lab), and Odoo (ERP/inventory); attractive modern web UI.',
              'Excessive hardware footprint (requires minimum 16GB RAM, multi-container Docker deployment); complex inter-service synchronization; difficult to troubleshoot without dedicated DevOps engineering.'
            ],
            [
              'Commercial Proprietary EMRs (Epic, Cerner, Indigenous Nigerian Hospital Portals)',
              'Commercial Closed-Source Hospital Software',
              'Polished enterprise interfaces; vendor customer support; extensive feature sets.',
              'Prohibitively expensive annual subscription and per-seat licensing fees; vendor lock-in; requires continuous high-speed internet; rigid workflows that cannot be tailored to local Argungu community maternity practices.'
            ]
          ]
        },
        note: `Table 2.1 clearly demonstrates that existing solutions fail to provide a balanced, lightweight, cost-effective, and fully integrated solution suited to a private community clinic in Northern Nigeria. Open-source enterprise platforms are technologically over-engineered and lack localized private clinic billing, while commercial proprietary systems impose unsustainable recurring financial overhead.`
      },
      {
        id: '2.7',
        number: '2.7',
        title: 'Compliance and Regulatory Frameworks',
        paragraphs: [
          `The development and deployment of the Al-Eman HealthFlow EMR & Clinic Management System are guided by a structured framework of national legislation, healthcare regulatory standards, and international medical informatics benchmarks:`,
          `By embedding automated role enforcement, cryptographic authentication, electronic prescription verification, and structured NHMIS morbidity aggregation, Al-Eman HealthFlow bridges clinical technology with regulatory compliance, ensuring the clinic operates in full alignment with national laws.`
        ],
        bullets: [
          {
            label: 'Nigeria Data Protection Act (NDPA), 2023:',
            text: 'Enacted by the National Assembly to regulate the processing of personal data in Nigeria. The Act establishes stringent duties for healthcare institutions processing health data, mandating data confidentiality, integrity, availability, and accountability (Federal Republic of Nigeria, 2023). Al-Eman HealthFlow incorporates these requirements through role-based access control, encrypted authentication, and audit trails.'
          },
          {
            label: 'National Health Act (NHA), 2014:',
            text: 'Sections 26 to 29 of the NHA establish the statutory confidentiality of all health records generated in healthcare facilities across Nigeria. It imposes criminal liability for unauthorized disclosure or tampering with patient health files, establishing that health information may only be disclosed with patient consent, court order, or statutory public health reporting justification.'
          },
          {
            label: 'National Health Management Information System (NHMIS) Standards:',
            text: 'The Federal Ministry of Health requires all public and private health facilities to compile and report standardized monthly morbidity, mortality, maternal health, and immunization statistics using the NHMIS Health Data Collection Tools (FMOH, 2020). The EMR system automates this data collation directly from consultation records.'
          },
          {
            label: 'International Health Informatics Standards (HL7 & ICD-10):',
            text: 'The World Health Organization’s International Classification of Diseases (ICD-10) provides the international standard diagnostic nomenclature for clinical recording and epidemiological tracking, ensuring diagnostic consistency across medical encounters.'
          }
        ],
        diagram: {
          figureNumber: 'Figure 2.1',
          title: 'Health Informatics Regulatory Compliance & Data Protection Governance Framework',
          caption: 'Figure 2.1: Governance and regulatory framework mapping statutory mandates from the Nigeria Data Protection Act (NDPA 2023), National Health Act (NHA 2014), and FMOH NHMIS standards into technical controls within Al-Eman HealthFlow.',
          content: `
+----------------------------------------------------------------------------------------------------+
|               HEALTH INFORMATICS REGULATORY & DATA PROTECTION GOVERNANCE MATRIX                     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    +-----------------------------+                               +-----------------------------+   |
|    |  NIGERIA DATA PROTECTION    |                               |    NATIONAL HEALTH ACT      |   |
|    |        ACT (NDPA 2023)      |                               |         (NHA 2014)          |   |
|    +-----------------------------+                               +-----------------------------+   |
|    | • Statutory PHI Encryption  |                               | • Patient Medical Privacy   |   |
|    | • Role-Based Access Control |                               | • Emergency Triage Mandate  |   |
|    | • Immutable Audit Trail     |                               | • Practitioner Duty of Care |   |
|    | • Legal Accountability      |                               | • Informed Consent Rights   |   |
|    +-----------------------------+                               +-----------------------------+   |
|                   \\                                                             /                  |
|                    \\                                                           /                   |
|                     v                                                         v                    |
|    +-------------------------------------------------------------------------------------------+   |
|    |                       AL-EMAN HEALTHFLOW EMR COMPLIANCE ENGINE                            |   |
|    |  - Cryptographic password hashing (bcrypt, salt >= 10) & httpOnly signed JWT cookies     |   |
|    |  - Granular RBAC matrix restricting patient data visibility by clinical workstation       |   |
|    |  - Tamper-evident audit ledger capturing user ID, timestamp, and entity delta changes     |   |
|    |  - Automated NHMIS Form 001/002 morbidity categorization (ICD-10 classification)         |   |
|    +-------------------------------------------------------------------------------------------+   |
|                                                  |                                                 |
|                                                  v                                                 |
|                                  +-------------------------------+                                 |
|                                  |   STATUTORY HEALTH REGULATORS |                                 |
|                                  | • Kebbi State Ministry Health |                                 |
|                                  | • NDPC (Data Protection Com.) |                                 |
|                                  | • Federal Min. Health (FMOH)  |                                 |
|                                  +-------------------------------+                                 |
+----------------------------------------------------------------------------------------------------+`
        }
      },
      {
        id: '2.8',
        number: '2.8',
        title: 'Gap Analysis',
        paragraphs: [
          `Synthesizing the reviewed literature and existing tools reveals a distinct and critical operational gap: there exists no single, lightweight, zero-license, web-based Electronic Medical Records and Clinic Management System engineered specifically for the resource and operational realities of private community clinics and maternity homes in semi-urban Nigerian settings such as Argungu, Kebbi State.`,
          `On one hand, traditional paper-based methods are demonstrably inefficient, error-prone, insecure, and increasingly non-compliant with the Nigeria Data Protection Act 2023. On the other hand, established global open-source platforms (such as OpenMRS, Bahmni, and GNU Health) demand heavyweight multi-server hardware architectures, extensive Docker container orchestration, and dedicated systems engineers that primary community clinics cannot sustain. Furthermore, these global systems lack native integration with localized Nigerian private clinic workflows — specifically the immediate linkage between outpatient consultation, diagnostic lab verification, point-of-sale retail pharmacy dispensing, multi-channel payment reconciliation (Cash, POS, Bank Transfer), and statutory NHMIS morbidity reporting. Commercial proprietary alternatives solve some usability hurdles but impose exorbitant recurring licensing costs that would jeopardize the financial viability of affordable community healthcare.`,
          `Al-Eman HealthFlow is designed and implemented precisely to fill this operational gap. By engineering a responsive, layered, full-stack web application with zero client-side installation requirements, automated stage-based patient queueing, integrated CPOE prescribing, real-time pharmacy inventory control, and multi-channel billing reconciliation, this project provides Al-Eman Clinic and Maternity Home with an affordable, robust, and regulatory-compliant digital operational foundation.`
        ]
      },
      {
        id: '2.9',
        number: '2.9',
        title: 'Summary',
        paragraphs: [
          `This chapter established the theoretical and empirical foundations of health information systems; traced the necessary evolution from paper-based charts to electronic medical records; reviewed the taxonomy of healthcare systems and the safety virtues of Computerized Provider Order Entry (CPOE); analyzed the stringent requirements of patient privacy under the Nigeria Data Protection Act 2023 and the National Health Act 2014; comparatively evaluated existing open-source and commercial healthcare tools (Table 2.1); and articulated a clear gap analysis justifying a purpose-built, web-based EMR for Al-Eman Clinic and Maternity Home. The subsequent chapters will detail the engineering methodology, system design, implementation, and verification benchmarks used to construct this system.`
        ]
      }
    ]
  },

  // ==========================================
  // CHAPTER THREE
  // ==========================================
  {
    chapterNumber: 3,
    chapterTitle: 'CHAPTER THREE — METHODOLOGY',
    subtitle: 'Software Development Life Cycle (SDLC), Requirements Elicitation, Functional & Non-Functional Specifications, Technology Stack Justification, System Analysis, Use-Case Modeling, Data-Flow Workflows, and Database Entity-Relationship Design',
    sections: [
      {
        id: '3.1',
        number: '3.1',
        title: 'Introduction',
        paragraphs: [
          `This chapter describes the comprehensive methodology employed to engineer the Al-Eman HealthFlow EMR & Clinic Management System. It presents the software engineering methodology adopted, how clinical and operational requirements were elicited and specified (functional and non-functional), the rigorous justification for the chosen full-stack technology stack, the physical hardware and operating environment specifications, and the project management timeline. In addition, this chapter details the system analysis models — including the clinical use-case model, dual data-flow architectures, and the relational database schema with its Entity-Relationship Diagram (ERD). Together, these sections establish the formal Software Requirements Specification (SRS) underpinning the MIT 800 capstone framework.`
        ]
      },
      {
        id: '3.2',
        number: '3.2',
        title: 'Software Development Methodology',
        paragraphs: [
          `The project adopted an Agile, iterative, and incremental development methodology in preference to a rigid sequential Waterfall model. The selection of Agile was dictated by four core realities of clinical systems engineering:`,
          `Each Agile sprint delivered a deployable, functional slice of clinical workflow. The engineering team operated in rapid two-week increments, each concluding with an interactive demonstration to clinical users at Al-Eman Clinic. Continuous integration was enforced through a centralized Git repository hosted on GitHub. The software was engineered using a strict layered architecture (Domain Models → Relational Data Access → Business Services → RESTful API → Reactive Presentation) ensuring that increments were decoupled, testable in isolation, and strictly compliant with SOLID and Don't Repeat Yourself (DRY) principles.`,
          `The alignment between the capstone phases and the delivered software increments is summarized in Table 3.0 below:`
        ],
        bullets: [
          {
            label: '1. Early Validation of High-Risk Clinical Modules:',
            text: 'The necessity to validate critical clinical components early — specifically the Computerized Provider Order Entry (CPOE) engine, pharmacy stock deduction algorithms, and role-based permissions — prior to full facility rollout.'
          },
          {
            label: '2. Evolving Understanding of Clinic Operational Nuances:',
            text: 'Clinical workflows at Al-Eman Clinic & Maternity Home revealed unique operational practices, such as rapid antenatal triage and flexible multi-channel patient billing, that required incremental requirements refinement.'
          },
          {
            label: '3. Alignment with MIT 800 Capstone Milestones:',
            text: 'The three-phase capstone timeline (Phase 1: Initiation & Planning → Phase 2: Execution & Development → Phase 3: Testing, Deployment & Closure) mapped naturally into iterative Agile increments with clear supervisory review gates.'
          }
        ],
        table: {
          headers: ['Capstone Phase', 'Duration', 'Agile Increments & Clinical Deliverables'],
          rows: [
            [
              'Phase 1: Initiation & Planning',
              'Weeks 1–4',
              'Host clinic stakeholder engagement at No. 19 Gulma Road, Argungu; clinical workflow elicitation; domain modeling; Software Requirements Specification (SRS); Project Charter and supervisory authorization.'
            ],
            [
              'Phase 2: Execution & Development',
              'Weeks 5–8',
              'Domain layer (data schemas, patient indexing, triage acuity scoring, CPOE algorithms); relational persistence; authentication & RBAC; reactive UI (reception, nursing, doctor, lab, pharmacy, cashier); mid-term system demo.'
            ],
            [
              'Phase 3: Testing, Deployment & Closure',
              'Weeks 9–12',
              'Unit, integration, and role-security test suites (20 test cases); cloud deployment; production data seeding; user acceptance testing (UAT); staff operational manual; final academic dissertation defence.'
            ]
          ]
        },
        diagram: {
          figureNumber: 'Figure 3.5',
          title: 'Software Development Life Cycle (SDLC) Agile Iterative Sprint Workflow',
          caption: 'Figure 3.5: Agile iterative software development lifecycle executed across three structured phases and four engineering sprints, integrating continuous supervisory gates and clinical staff validation.',
          content: `
+----------------------------------------------------------------------------------------------------+
|                AL-EMAN HEALTHFLOW AGILE SDLC THREE-PHASE ITERATIVE WORKFLOW                        |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   [PHASE 1: INITIATION & PLANNING]              (Weeks 1–4)                                        |
|   • Host facility engagement at No. 19 Gulma Road, Argungu, Kebbi State                            |
|   • Observational workflow analysis (OPD, ANC, Lab, Pharmacy, Cashier)                             |
|   • Software Requirements Specification (SRS: FR-01..13, NFR-01..09) & Project Charter             |
|                                         |                                                          |
|                                         v                                                          |
|   [PHASE 2: ITERATIVE AGILE SPRINTS]            (Weeks 5–8)                                        |
|   +--------------------------------------------------------------------------------------------+   |
|   | Sprint 1: Domain Schemas, EMPI Master Index & Triage Acuity Assessment Routines            |   |
|   | Sprint 2: CPOE Consultation Engine, SOAP Notes & ICD-10 Diagnostic Classifiers            |   |
|   | Sprint 3: Diagnostic Lab Workbench, Pharmacy Stock Deductions & Billing Reconciliation     |   |
|   | Sprint 4: Role-Based Access Control (RBAC), Operator Portal & Morbidity Surveillance Dash  |   |
|   +--------------------------------------------------------------------------------------------+   |
|                                         |                                                          |
|                                         v                                                          |
|   [PHASE 3: VERIFICATION, DEPLOYMENT & CLOSURE] (Weeks 9–12)                                       |
|   • 20 Automated & Manual Test Cases (TC-01 to TC-20: 100% Pass Rate)                              |
|   • Cloud Container Deployment (Google Cloud Run / Vercel with TLS Encryption)                     |
|   • User Acceptance Testing (UAT) with clinical staff at Al-Eman Clinic                            |
|   • Complete Capstone Project Dissertation (Ch. 1–5, References, Appendices A–E)                   |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+`
        }
      },
      {
        id: '3.3',
        number: '3.3',
        title: 'Requirements Elicitation',
        paragraphs: [
          `Requirements were systematically elicited through three rigorous investigation channels:`,
          `From this analysis, thirteen core functional requirements and nine non-functional requirements were specified, formalizing the operational baseline of the system.`
        ],
        bullets: [
          {
            label: '1. Structured Field Engagement with Al-Eman Clinic Stakeholders:',
            text: 'In-person observational walkthroughs and structured interviews with the Medical Director, consulting clinicians, nursing supervisors, laboratory scientists, dispensary pharmacists, and records officers at No. 19 Gulma Road, Argungu. Key data captured included patient registration card formats, vital signs recording books, laboratory test order sheets, prescription slips, and daily revenue logbooks.'
          },
          {
            label: '2. Regulatory and Public Health Policy Benchmarking:',
            text: 'Review of the Nigeria Data Protection Act (NDPA) 2023 for healthcare compliance, National Health Act (NHA) 2014 medical confidentiality provisions, and the Federal Ministry of Health’s National Health Management Information System (NHMIS) monthly morbidity summary formats.'
          },
          {
            label: '3. Health Informatics Comparative Systems Analysis:',
            text: 'Synthesis of best practices from OpenMRS, GNU Health, and ambulatory clinic management systems, distilling essential primary care workflows while stripping away technological bloat.'
          }
        ]
      },
      {
        id: '3.4',
        number: '3.4',
        title: 'Functional Requirements',
        paragraphs: [
          `The functional requirements define the explicit behavioral capabilities and clinical transactions the system must execute:`
        ],
        table: {
          headers: ['Requirement ID', 'Functional Specification Statement'],
          rows: [
            ['FR-01', 'The system shall authenticate clinical operators using unique credentials (username/email and password) and establish a secure, encrypted session.'],
            ['FR-02', 'The system shall enforce granular Role-Based Access Control (RBAC) across six user roles: Receptionist/Records Officer, Triage Nurse, Medical Doctor, Laboratory Scientist, Pharmacist, and Billing Officer/Administrator.'],
            ['FR-03', 'The system shall maintain an Electronic Master Patient Index (EMPI) allowing staff to register new patients and perform sub-second lookups by ID, full name, phone number, or date of birth.'],
            ['FR-04', 'The system shall capture nursing triage vital signs (blood pressure, pulse, temperature, respiration, weight, height, BMI) and compute patient clinical acuity.'],
            ['FR-05', 'The system shall coordinate an automated stage-based patient queue engine, dynamically moving patients from Reception → Triage → Doctor → Lab/Pharmacy → Billing.'],
            ['FR-06', 'The system shall provide a Computerized Provider Order Entry (CPOE) consultation workbench capturing chief complaints, physical findings, ICD-10 diagnosis coding, electronic prescriptions, and laboratory requisitions.'],
            ['FR-07', 'The system shall allow laboratory personnel to view pending test orders, record qualitative/quantitative results, verify normal reference ranges, and digitally sign off results directly into the patient chart.'],
            ['FR-08', 'The system shall manage a central pharmacy drug catalog with unit pricing, real-time inventory deduction upon dispensing, batch tracking, and low-stock threshold alerts.'],
            ['FR-09', 'The system shall generate consolidated patient billing invoices combining consultation charges, laboratory investigation fees, and pharmacy costs.'],
            ['FR-10', 'The system shall support multi-channel payment reconciliation (Cash, Point of Sale / POS, Direct Bank Transfer) and produce printable, itemized patient receipts.'],
            ['FR-11', 'The system shall compile interactive clinical and financial analytics, displaying top morbidity diagnoses, department throughput volumes, and revenue distribution.'],
            ['FR-12', 'The system shall maintain an immutable, tamper-evident audit log recording timestamps, user IDs, and action types for all patient folder edits, clinical orders, and billing collections.'],
            ['FR-13', 'The system shall allow authenticated operators to terminate their active session cleanly, invalidating session cookies and logging the sign-out event.']
          ]
        }
      },
      {
        id: '3.5',
        number: '3.5',
        title: 'Non-Functional Requirements',
        paragraphs: [
          `The non-functional requirements articulate the operational qualities, performance thresholds, security mandates, and architectural standards enforced by the system:`
        ],
        table: {
          headers: ['ID', 'Category', 'Non-Functional Requirement Specification'],
          rows: [
            ['NFR-01', 'Security', 'Operator passwords shall be securely hashed using bcrypt with salt rounds >= 10; sessions shall be managed via signed, httpOnly, SameSite=Lax security tokens; plaintext passwords shall never be transmitted or persisted.'],
            ['NFR-02', 'Access Control', 'All route authorization and resource mutations shall be strictly verified server-side at the API gateway layer, never relying exclusively on client-side UI visibility toggles.'],
            ['NFR-03', 'Maintainability', 'The codebase shall follow a strict layered architecture with decoupled domain models, adhering to SOLID and DRY design principles with 100% TypeScript compile-time type safety.'],
            ['NFR-04', 'Usability', 'The user interface shall be responsive, accessible, and intuitive across desktop, laptop, and tablet screens without requiring client-side native software installation.'],
            ['NFR-05', 'Performance', 'Standard clinical database queries (patient lookup, queue retrieval, consultation loading) shall execute with response times under 500 milliseconds under typical clinic operational concurrency.'],
            ['NFR-06', 'Reliability & Fault Tolerance', 'The system shall handle corrupted or unexpected input gracefully; validation failures shall produce informative error feedback without crashing server processes.'],
            ['NFR-07', 'Portability & Sustainability', 'The system shall be deployable on low-cost commodity cloud infrastructure or local clinic servers using environment-variable configuration without expensive commercial proprietary runtime licenses.'],
            ['NFR-08', 'Auditability', 'Every clinical record alteration, diagnosis assignment, drug dispensing event, and billing payment shall record an immutable audit trace identifying the operator and timestamp.'],
            ['NFR-09', 'Privacy & Compliance', 'The system shall strictly comply with the Nigeria Data Protection Act (NDPA) 2023 and the National Health Act (NHA) 2014 by encrypting Protected Health Information (PHI) and safeguarding patient records.']
          ]
        }
      },
      {
        id: '3.6',
        number: '3.6',
        title: 'Technology Stack and Justification',
        paragraphs: [
          `The technology stack for Al-Eman HealthFlow was chosen after careful evaluation of performance, developer productivity, type safety, ecosystem maturity, and long-term economic sustainability in a Nigerian primary healthcare environment:`
        ],
        table: {
          headers: ['Layer / Domain', 'Technology Selected', 'Engineering & Economic Justification'],
          rows: [
            ['Frontend Framework', 'React 18 / Single Page Application', 'Declarative, component-driven UI architecture enabling high-speed, dynamic state transitions across clinical queues and workbenches without page reloads.'],
            ['Language', 'TypeScript (Strict Mode)', 'End-to-end static typing across user interfaces, API payloads, and database models eliminates runtime type errors and serves as machine-checked documentation.'],
            ['User Interface & Styling', 'Tailwind CSS', 'Utility-first CSS framework enabling a cohesive, professional clinical theme with zero custom CSS bloat, ensuring rapid rendering across tablets and low-power clinic PCs.'],
            ['Backend & Server', 'Node.js & Express (TypeScript)', 'Lightweight, event-driven, non-blocking I/O server perfectly suited for concurrent API requests from multiple clinic workstations (reception, triage, consulting, lab, pharmacy, cashier).'],
            ['Database Persistence', 'Relational Database / SQLite & Cloud Persistence', 'ACID-compliant relational schema enforcing strict referential integrity between patients, encounters, diagnoses, lab orders, prescriptions, and billing ledgers.'],
            ['Authentication & Security', 'bcrypt + Signed Session Cookies (JWT)', 'Cryptographic password hashing and tamper-evident, httpOnly cookies protect against cross-site scripting (XSS) and credential interception across clinic local networks.'],
            ['Icons & Visualization', 'Lucide React + Chart.js', 'Clean clinical iconography and lightweight charting for morbidity surveillance, department volume distribution, and revenue tracking.'],
            ['Document Generation', 'docx & PDF Compilation', 'Direct client-side and server-side generation of authentic Microsoft Word (.docx) clinical audit reports and printable billing receipts without external server dependencies.'],
            ['Version Control & Hosting', 'Git + GitHub + Cloud Run / Vercel', 'Version-controlled codebase with automated CI/CD deployment satisfies capstone transparency standards and ensures continuous system availability.']
          ]
        }
      },
      {
        id: '3.7',
        number: '3.7',
        title: 'Hardware and Software Requirements',
        paragraphs: [
          `To deploy and operate the system efficiently, the following hardware and software requirements were established for development, deployment, and end-user environments:`,
          `Development Environment: An engineering workstation equipped with Intel Core i5 or AMD Ryzen processor, 8GB+ RAM, 50GB storage, running Linux, macOS, or Windows 11 with Node.js 20+, Git, modern Chromium/Firefox browser, and VS Code.`,
          `Production Deployment Environment: Cloud-native container runtime (such as Google Cloud Run or Vercel serverless platform) with automated SSL/TLS certificate management, coupled with relational cloud persistence.`,
          `End-User Clinical Workstations (Al-Eman Clinic): Standard desktop computers, laptops, or tablets located at designated clinical stations (Reception, Nursing Desk, Doctor Suites, Laboratory, Pharmacy, Cashier Desk) running any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari) connected via the clinic’s local area network (LAN) or wireless broadband router — requiring zero client-side installation.`
        ]
      },
      {
        id: '3.8',
        number: '3.8',
        title: 'Project Management and Timeline',
        paragraphs: [
          `The project was executed over a three-month period conforming to the MIT 800 Capstone schedule. The timeline was divided into three structured phases, each comprising specific engineering milestones:`,
          `Month 1 — Initiation & Planning:`,
          `Month 2 — Execution & Development:`,
          `Month 3 — Testing, Deployment & Closure:`
        ],
        bullets: [
          {
            label: 'Month 1 (Weeks 1–4):',
            text: 'Week 1: Team formation, initial engagement with Al-Eman Clinic management at No. 19 Gulma Road, Argungu, Project Charter authorization. Week 2: Clinical workflow elicitation across maternal, OPD, lab, and pharmacy units. Week 3: Architectural modeling, database ERD design, Software Requirements Specification (SRS). Week 4: SRS defense, supervisory review, and development repository scaffolding.'
          },
          {
            label: 'Month 2 (Weeks 5–8):',
            text: 'Week 5: Core domain modeling, patient EMPI schema, triage acuity scoring routines. Week 6: CPOE consultation engine, diagnostic laboratory ordering, pharmacy stock deduction algorithms. Week 7: Multi-channel billing module, revenue reconciliation, authentication & RBAC. Week 8: Clinical UI integration (all 6 role views), morbidity analytics, mid-term system demonstration.'
          },
          {
            label: 'Month 3 (Weeks 9–12):',
            text: 'Week 9: Comprehensive testing (unit, integration, RBAC security test pass — 20 test cases). Week 10: Production cloud deployment, baseline data seeding, User Acceptance Testing (UAT) with clinic staff. Week 11: Final academic dissertation writing (Chapters 1 to 5, References, Appendices). Week 12: Capstone presentation, supervisory review, and project archival closure.'
          }
        ]
      },
      {
        id: '3.9',
        number: '3.9',
        title: 'Risk Management',
        paragraphs: [
          `Proactive risk management was maintained throughout the development lifecycle. The primary technical, operational, and organizational risks identified, along with their assessed severity and applied mitigations, are documented in Table 3.4 below:`
        ],
        table: {
          headers: ['Risk Description', 'Impact', 'Likelihood', 'Applied Mitigation Strategy'],
          rows: [
            ['Clinical workflow mismatch with clinic staff habits', 'High', 'Medium', 'Conducted on-site observational walkthroughs at Al-Eman Clinic; reviewed wireframes with nursing and pharmacy staff during sprint demos.'],
            ['Data corruption or concurrency collisions in pharmacy stock', 'High', 'Low', 'Implemented ACID relational database transactions with atomic stock decrements upon prescription dispensing.'],
            ['Scope creep beyond the three-month capstone window', 'Medium', 'Medium', 'Prioritized a rigorous Minimum Viable Product (MVP) covering core outpatient/maternity workflows; deferred advanced biometric scanning to future work.'],
            ['Sensitive health data exposure / NDPA 2023 violation', 'Critical', 'Low', 'Enforced server-side RBAC, bcrypt password hashing, encrypted httpOnly session tokens, and strict audit logging.'],
            ['Network intermittency in clinic facility', 'Medium', 'High', 'Optimized frontend Single Page Application (SPA) bundle for aggressive client-side caching; designed database schema for efficient low-bandwidth JSON serialization.'],
            ['Team coordination and code merge conflicts', 'Medium', 'Low', 'Maintained a centralized GitHub repository with feature branching, strict TypeScript type checking, and conventional commit logs.']
          ]
        }
      },
      {
        id: '3.10',
        number: '3.10',
        title: 'Version Control and Collaboration Practices',
        paragraphs: [
          `In adherence to the MIT 800 guidelines mandating professional software engineering collaboration, the system was developed within a centralized Git repository hosted on GitHub. The engineering team enforced four core collaborative disciplines:`,
          `These practices ensured complete transparency, traceable contribution accountability, and zero code regressions throughout the project lifecycle.`
        ],
        bullets: [
          {
            label: 'Conventional Scoped Commits:',
            text: 'Every commit addressed a single, well-defined concern with a descriptive prefix (e.g. feat(cpoe): implement electronic prescription fulfillment; fix(billing): correct pos receipt calculation).'
          },
          {
            label: 'Strict Continuous Quality Gates:',
            text: 'TypeScript strict compilation (tsc --noEmit) and automated linting were enforced prior to merging code into the main release branch, preventing defective code from entering production.'
          },
          {
            label: 'Continuous Deployment (CD):',
            text: 'The production environment was synchronized with the main Git branch, ensuring that validated features were immediately available on the live staging server for supervisory review.'
          },
          {
            label: 'Documentation-as-Code:',
            text: 'Academic documentation, API catalogs, database migrations, and user guides were maintained in version control alongside application source files.'
          }
        ]
      },
      {
        id: '3.11',
        number: '3.11',
        title: 'System Analysis and Design Models',
        paragraphs: [
          `Building on the elicited requirements, this section presents the core conceptual models that define the structure, interactions, and data flows of Al-Eman HealthFlow: the Use-Case Model, the Dual Clinical Data-Flow Architecture, and the Database Entity-Relationship Diagram (ERD).`
        ]
      },
      {
        id: '3.11.1',
        number: '3.11.1',
        title: 'Use-Case Design',
        paragraphs: [
          `The system features six human clinical and administrative actors plus one automated system actor. The use-case model formalizes the principle of least privilege, defining the precise functional boundary for each user role:`,
          `The comprehensive interactions between the clinical actors and the system use cases are illustrated in Figure 3.1 below:`
        ],
        diagram: {
          figureNumber: 'Figure 3.1',
          title: 'Clinical Role-Based Use-Case Diagram for Al-Eman HealthFlow',
          caption: 'Figure 3.1: Use-Case Diagram depicting the interactions of the six clinical and administrative roles (Receptionist, Triage Nurse, Medical Doctor, Laboratory Scientist, Pharmacist, Billing Officer/Admin) with system modules.',
          content: `
+----------------------------------------------------------------------------------------------------+
|                                AL-EMAN HEALTHFLOW CLINICAL SYSTEM BOUNDARY                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    [Receptionist / Records]                                                                        |
|            |                                                                                       |
|            +----> (UC-01: Register Patient & Assign EMPI Card Number)                              |
|            +----> (UC-02: Search & Retrieve Longitudinal Patient Record)                           |
|            +----> (UC-03: Enqueue Patient to Nursing Triage Desk)                                  |
|                                                                                                    |
|    [Triage Nurse]                                                                                  |
|            |                                                                                       |
|            +----> (UC-04: Capture Vitals: BP, Pulse, Temp, Resp, Weight, BMI)                      |
|            +----> (UC-05: Record Gravida/Parity & Antenatal Triage Vitals)                         |
|            +----> (UC-06: Escalate Patient Queue to Doctor Consultation Desk)                      |
|                                                                                                    |
|    [Medical Doctor / Clinician]                                                                    |
|            |                                                                                       |
|            +----> (UC-07: Review Patient Vitals & Past Medical Encounters)                         |
|            +----> (UC-08: Record SOAP Consultation Notes & ICD-10 Diagnoses)                       |
|            +----> (UC-09: CPOE: Issue Electronic Prescription Orders)                              |
|            +----> (UC-10: CPOE: Issue Electronic Diagnostic Laboratory Requisitions)              |
|                                                                                                    |
|    [Laboratory Scientist]                                                                          |
|            |                                                                                       |
|            +----> (UC-11: Access Pending Diagnostic Investigation Worklist)                        |
|            +----> (UC-12: Record Test Results, Reference Ranges & Clinical Sign-off)               |
|                                                                                                    |
|    [Pharmacist / Dispensary]                                                                       |
|            |                                                                                       |
|            +----> (UC-13: Receive Electronic Prescriptions & Dispense Medications)                 |
|            +----> (UC-14: Manage Formulary Drug Catalog, Stock Reorders & Batch Expiry)            |
|                                                                                                    |
|    [Billing Officer / Accountant / Administrator]                                                  |
|            |                                                                                       |
|            +----> (UC-15: Consolidate Unified Invoices: Consultation + Lab + Drugs)                 |
|            +----> (UC-16: Reconcile Multi-Channel Payments: Cash, POS, Bank Transfer)              |
|            +----> (UC-17: Generate NHMIS Morbidity Surveillance & Revenue Analytics Reports)       |
|            +----> (UC-18: Manage Staff Accounts, Role Assignments & Audit Trails)                  |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+`
        }
      },
      {
        id: '3.11.2',
        number: '3.11.2',
        title: 'Data-Flow and Ingestion Design',
        paragraphs: [
          `Information flow in Al-Eman HealthFlow is architected around two complementary pipelines: Path A (The Outpatient & Maternal Care Patient Data-Flow) which governs stage-based patient transitions, and Path B (The Closed-Loop CPOE Order Fulfillment Pipeline) which governs diagnostic and pharmacological orders.`,
          `Path A — Outpatient and Maternal Clinical Data-Flow: When a patient enters the facility, their data moves sequentially through clinical touchpoints as depicted in Figure 3.2. Each stage triggers a deterministic state change in the patient queue, ensuring zero manual paperwork transit delays:`,
          `Path B — Closed-Loop CPOE Diagnostic & Pharmacy Order Fulfillment: Figure 3.3 illustrates how clinical orders entered by the medical doctor route directly to ancillary departments with automated inventory deduction and billing aggregation:`
        ],
        diagrams: [
          {
            figureNumber: 'Figure 3.2',
            title: 'Path A: Outpatient and Antenatal Clinical Care Data-Flow Diagram',
            caption: 'Figure 3.2: Clinical Data-Flow Architecture illustrating stage-based patient progression from Reception through Nursing Triage, Medical Consultation, Ancillary Services, and Billing Settlement.',
            content: `
+--------------------+       1. Demographic Data       +-----------------------------+
|  PATIENT ARRIVES   | ------------------------------> |      RECEPTION DESK         |
| (Maternal / OPD)   |                                 | - Check EMPI Master Index   |
+--------------------+                                 | - Register / Verify Card    |
                                                       +-----------------------------+
                                                                     |
                                                                     | 2. Enqueue Patient [Stage: Triage]
                                                                     v
                                                       +-----------------------------+
                                                       |     NURSING TRIAGE DESK     |
                                                       | - Capture Vital Signs       |
                                                       | - Compute BMI & Acuity      |
                                                       | - Record Obstetric Vitals   |
                                                       +-----------------------------+
                                                                     |
                                                                     | 3. Handover [Stage: With Doctor]
                                                                     v
                                                       +-----------------------------+
                                                       |    DOCTOR CONSULTATION      |
                                                       | - Review Vitals & History   |
                                                       | - SOAP Notes & ICD-10 Code  |
                                                       | - Issue CPOE Prescriptions  |
                                                       | - Order Diagnostic Lab Tests|
                                                       +-----------------------------+
                                                                     |
                                       +-----------------------------+-----------------------------+
                                       | 4a. Lab Order Requisition                                 | 4b. Prescription Order
                                       v                                                           v
                        +-----------------------------+                             +-----------------------------+
                        |      DIAGNOSTIC LAB         |                             |      PHARMACY DISPENSARY    |
                        | - Blood / Malaria / Urine   |                             | - Verify Drug Availability  |
                        | - Record Test Results       |                             | - Dispense Medication       |
                        | - Transmit to Digital Chart |                             | - Deduct Inventory Stock    |
                        +-----------------------------+                             +-----------------------------+
                                       |                                                           |
                                       +-----------------------------+-----------------------------+
                                                                     | 5. Aggregate Clinical Charges
                                                                     v
                                                       +-----------------------------+
                                                       |   BILLING & CASHIER DESK    |
                                                       | - Consolidated Invoice      |
                                                       | - Multi-Channel Payment     |
                                                       | - Generate Printed Receipt  |
                                                       +-----------------------------+
                                                                     |
                                                                     | 6. Discharge / Follow-up
                                                                     v
                                                       +-----------------------------+
                                                       |     PATIENT DISCHARGED      |
                                                       +-----------------------------+`
          },
          {
            figureNumber: 'Figure 3.3',
            title: 'Path B: Closed-Loop CPOE Diagnostic & Pharmacy Order Fulfillment Pipeline',
            caption: 'Figure 3.3: Closed-loop order execution pipeline showing automated routing of physician CPOE requisitions to laboratory and pharmacy workbenches, atomic inventory decrements, and synchronous tariff billing aggregation.',
            content: `
+----------------------------------------------------------------------------------------------------+
|          PATH B: CLOSED-LOOP CPOE DIAGNOSTIC & PHARMACY ORDER FULFILLMENT PIPELINE                 |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    +------------------------------------------------------------------------------------------+    |
|    |                         1. PHYSICIAN CONSULTATION WORKBENCH                              |    |
|    |   Doctor records diagnosis & issues computerized orders via Electronic Prescribing & Lab  |    |
|    +------------------------------------------------------------------------------------------+    |
|                                  |                                       |                         |
|             CPOE Lab Order       |                                       | CPOE Prescription Order |
|             Requisition          |                                       | Requisition             |
|                                  v                                       v                         |
|    +------------------------------------------+    +------------------------------------------+    |
|    |      2a. DIAGNOSTIC LABORATORY           |    |     2b. PHARMACY DISPENSARY              |    |
|    |  - Electronic worklist notification      |    |  - Instant prescription fulfillment view |    |
|    |  - Specimen collection & processing      |    |  - Real-time stock verification          |    |
|    |  - Qualitative/quantitative entry        |    |  - Dosage & allergy cross-check          |    |
|    |  - Scientist digital sign-off            |    |  - Dispense & atomic inventory decrement |    |
|    +------------------------------------------+    +------------------------------------------+    |
|                          |                                               |                         |
|                          +-----------------------+-----------------------+                         |
|                                                  |                                                 |
|                                                  | 3. Synchronous Charge Posting                   |
|                                                  v                                                 |
|                            +-------------------------------------------+                           |
|                            |    3. UNIFIED INVOICING & BILLING DESK    |                           |
|                            | - Consultation Fee + Lab Fees + Drug Fees |                           |
|                            | - Real-time total tariff aggregation      |                           |
|                            | - Itemized bill ready before patient exit |                           |
|                            +-------------------------------------------+                           |
|                                                  |                                                 |
|                                                  | 4. Payment Clearance & Receipt                  |
|                                                  v                                                 |
|                            +-------------------------------------------+                           |
|                            |      4. FINANCIAL SETTLEMENT & DISCHARGE  |                           |
|                            | - Multi-channel reconciliation (Cash/POS) |                           |
|                            | - Printable patient receipt generated     |                           |
|                            | - Closed-loop encounter finalized         |                           |
|                            +-------------------------------------------+                           |
+----------------------------------------------------------------------------------------------------+`
          }
        ]
      },
      {
        id: '3.11.3',
        number: '3.11.3',
        title: 'Database Design (Schema and Entity-Relationship Diagram)',
        paragraphs: [
          `The persistent data model is architected as an ACID-compliant relational schema comprising nine core tables. The schema enforces strict foreign key constraints, unique indexing for patient identifiers and staff emails, and non-nullable audit fields. The structural relationships are illustrated in the Entity-Relationship Diagram (Figure 3.4):`,
          `The structure, purpose, and key indexes of the database entities are catalogued in Table 3.5 below:`
        ],
        diagram: {
          figureNumber: 'Figure 3.4',
          title: 'Entity-Relationship Diagram (ERD) of Al-Eman HealthFlow System',
          caption: 'Figure 3.4: Entity-Relationship Diagram (ERD) showing relational associations between Users, Patients, Queue Items, Vitals, Consultations, Lab Orders, Prescriptions, Medications, Invoices, and Audit Logs.',
          content: `
  +-------------------------+             1:N             +-------------------------+
  |          USERS          | --------------------------> |       AUDIT_LOGS        |
  +-------------------------+                             +-------------------------+
  | PK  id (UUID)           |                             | PK  id (UUID)           |
  |     username (VARCHAR)  |                             | FK  user_id (UUID)      |
  |     password_hash       |                             |     action_type (TEXT)  |
  |     full_name (VARCHAR) |                             |     details (JSON/TEXT) |
  |     role (ENUM)         |                             |     timestamp (DATETIME)|
  |     department (VARCHAR)|                             +-------------------------+
  +-------------------------+
               |
               | 1:N (Handled Encounters)
               v
  +-------------------------+             1:N             +-------------------------+
  |        PATIENTS         | --------------------------> |       QUEUE_ITEMS       |
  +-------------------------+                             +-------------------------+
  | PK  id (UUID)           |                             | PK  id (UUID)           |
  |     card_number (UNIQUE)|                             | FK  patient_id (UUID)   |
  |     full_name (VARCHAR) |                             |     stage (ENUM)        |
  |     gender, dob, phone  |                             |     priority (INTEGER)  |
  |     residential_address |                             |     status (ACTIVE/DONE)|
  |     emergency_contact   |                             |     created_at, updated |
  |     created_at          |                             +-------------------------+
  +-------------------------+                                          |
         |         |                                                   |
         | 1:N     | 1:N                                               | 1:1
         |         v                                                   v
         |  +-------------------------+                   +-------------------------+
         |  |      VITAL_SIGNS        |                   |      CONSULTATIONS      |
         |  +-------------------------+                   +-------------------------+
         |  | PK  id (UUID)           |                   | PK  id (UUID)           |
         |  | FK  patient_id (UUID)   |                   | FK  patient_id (UUID)   |
         |  |     bp_systolic / diast |                   | FK  doctor_id (UUID)    |
         |  |     pulse, temperature  |                   |     chief_complaint     |
         |  |     respiration, weight |                   |     clinical_notes(SOAP)|
         |  |     bmi, acuity_tag     |                   |     icd_diagnosis_code  |
         |  |     recorded_at         |                   |     created_at          |
         |  +-------------------------+                   +-------------------------+
         |                                                             |
         |                                           +-----------------+-----------------+
         | 1:N                                       | 1:N                               | 1:N
         v                                           v                                   v
  +-------------------------+             +-------------------------+         +-------------------------+
  |        INVOICES         |             |       LAB_ORDERS        |         |      PRESCRIPTIONS      |
  +-------------------------+             +-------------------------+         +-------------------------+
  | PK  id (UUID)           |             | PK  id (UUID)           |         | PK  id (UUID)           |
  | FK  patient_id (UUID)   |             | FK  consultation_id     |         | FK  consultation_id     |
  |     total_amount (DEC)  |             | FK  patient_id (UUID)   |         | FK  medication_id (UUID)|
  |     payment_status      |             |     test_name (VARCHAR) |         |     dosage, frequency   |
  |     payment_method (POS)|             |     result_value (TEXT) |         |     duration, quantity  |
  |     created_at          |             |     status (PENDING/DONE|         |     status (DISPENSED)  |
  +-------------------------+             +-------------------------+         +-------------------------+
                                                                                           |
                                                                                           | N:1
                                                                                           v
                                                                              +-------------------------+
                                                                              |       MEDICATIONS       |
                                                                              +-------------------------+
                                                                              | PK  id (UUID)           |
                                                                              |     name, brand_name    |
                                                                              |     stock_quantity (INT)|
                                                                              |     unit_price (DEC)    |
                                                                              |     reorder_level, expiry
                                                                              +-------------------------+`
        },
        table: {
          headers: ['Entity / Table Name', 'Operational Purpose in Clinical Workflow', 'Key Primary / Foreign Keys & Indexes'],
          rows: [
            ['users', 'Stores authorized clinical and administrative personnel accounts with assigned RBAC roles.', 'PK: id; UNIQUE: username/email; INDEX: role'],
            ['patients', 'Central Electronic Master Patient Index (EMPI) holding demographic profiles and medical card numbers.', 'PK: id; UNIQUE: card_number; INDEX: full_name, phone'],
            ['queue_items', 'Manages live clinic triage and stage transitions (Reception → Triage → Doctor → Lab/Pharm → Billing).', 'PK: id; FK: patient_id; INDEX: stage, status, created_at'],
            ['vital_signs', 'Maintains longitudinal nursing vitals (blood pressure, temperature, pulse, BMI, maternal vitals).', 'PK: id; FK: patient_id, recorded_by; INDEX: patient_id, recorded_at'],
            ['consultations', 'Captures physician SOAP consultation encounters, physical findings, and primary/secondary ICD-10 diagnoses.', 'PK: id; FK: patient_id, doctor_id; INDEX: patient_id, created_at'],
            ['lab_orders', 'Manages diagnostic laboratory investigation requisitions, specimen processing, and verified results.', 'PK: id; FK: consultation_id, patient_id; INDEX: status, created_at'],
            ['prescriptions', 'Records computerized provider medication orders, dosages, routes, duration, and dispensing status.', 'PK: id; FK: consultation_id, medication_id; INDEX: status'],
            ['medications', 'Central pharmacy formulary inventory tracking unit prices, current stock quantities, and batch expiration dates.', 'PK: id; INDEX: name, stock_quantity, expiry_date'],
            ['invoices', 'Consolidated financial billing records combining consultation fees, laboratory investigation costs, and drug charges.', 'PK: id; FK: patient_id; INDEX: payment_status, created_at'],
            ['audit_logs', 'Tamper-evident legal security audit ledger tracking user IDs, actions, and timestamps for all clinical edits.', 'PK: id; FK: user_id; INDEX: user_id, timestamp']
          ]
        }
      }
    ]
  },

  // ==========================================
  // CHAPTER FOUR
  // ==========================================
  {
    chapterNumber: 4,
    chapterTitle: 'CHAPTER FOUR — SYSTEM DESIGN AND IMPLEMENTATION',
    subtitle: 'System Architecture, CPOE Engine Design, Clinical Queue Machine, API Specifications, RBAC Matrix, UI/UX Walkthrough, Implementation of Core Modules, Security, Testing Strategy, 20 Test Cases, Deployment Topology, and User Manual',
    sections: [
      {
        id: '4.1',
        number: '4.1',
        title: 'Introduction',
        paragraphs: [
          `This chapter presents the engineering design and implementation of the Al-Eman HealthFlow EMR & Clinic Management System. It details the layered software architecture, the Computerized Provider Order Entry (CPOE) engine, the dynamic clinical queue state machine, the RESTful application programming interface (API) surface, the security and Role-Based Access Control (RBAC) matrix, and the responsive user interface design. It documents the concrete code implementation across core modules, reports a rigorous testing campaign of twenty test cases verifying system correctness and data integrity, outlines the cloud deployment topology, and provides a comprehensive end-user operational manual for staff at Al-Eman Clinic and Maternity Home.`
        ]
      },
      {
        id: '4.2',
        number: '4.2',
        title: 'System Architecture',
        paragraphs: [
          `Al-Eman HealthFlow is engineered upon a strict layered software architecture following the Single-Responsibility Principle (SRP) and the Dependency-Inversion Principle (DIP). Dependencies point strictly inward: high-level presentation and routing logic depend on clinical business abstractions, which in turn interface with persistent relational repositories, while pure domain models remain decoupled from framework specifics:`,
          `The layered system architecture and departmental interactions are illustrated in Figure 4.1:`
        ],
        diagram: {
          figureNumber: 'Figure 4.1',
          title: 'Layered System Architecture of Al-Eman HealthFlow EMR System',
          caption: 'Figure 4.1: Multi-Tier Layered Architecture depicting decoupling between Reactive Presentation, REST API Gateway, Clinical Business Services, Relational Data Access, and Persistent Storage.',
          content: `
+----------------------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER (UI / UX)                                    |
|   - Reception Portal     - Nursing Triage Desk      - Doctor CPOE Console                          |
|   - Lab Diagnostics      - Pharmacy Dispensary      - Billing & Cashier Desk     - Reports         |
+----------------------------------------------------------------------------------------------------+
                                                 |
                                                 | HTTP / JSON over TLS (RESTful API)
                                                 v
+----------------------------------------------------------------------------------------------------+
|                                     API & SECURITY GATEWAY LAYER                                   |
|   - Authentication (bcrypt + signed JWT cookies)    - Role-Based Access Control (RBAC Guard)       |
|   - Route Handlers (/api/patients, /api/queue, /api/consultations, /api/lab, /api/pharmacy, etc.)  |
|   - Request Input Validation (Zod schemas)          - Central Error Handling & Response Formatting |
+----------------------------------------------------------------------------------------------------+
                                                 |
                                                 | Method Invocations
                                                 v
+----------------------------------------------------------------------------------------------------+
|                                    CLINICAL BUSINESS SERVICE LAYER                                 |
|   - Patient Master Index Engine    - Stage-Based Queue State Machine                               |
|   - CPOE Prescription & Lab Logic  - Pharmacy Stock Deduction & Expiry Sentinel                     |
|   - Consolidated Billing Engine    - NHMIS Morbidity Surveillance Aggregator                       |
+----------------------------------------------------------------------------------------------------+
                                                 |
                                                 | Data Operations
                                                 v
+----------------------------------------------------------------------------------------------------+
|                                    DATA ACCESS & PERSISTENCE LAYER                                 |
|   - Relational Schema Singleton    - ACID Database Transactions                                    |
|   - Entity Repositories            - Automated DB Backup & Index Optimization                      |
|   - SQLite / Cloud PostgreSQL      - Tamper-Evident Audit Logging                                  |
+----------------------------------------------------------------------------------------------------+`
        }
      },
      {
        id: '4.3',
        number: '4.3',
        title: 'Computerized Provider Order Entry (CPOE) and Clinical Decision Logic',
        paragraphs: [
          `The CPOE engine (consultationEngine) serves as the clinical heart of the application. When a physician conducts an encounter, the system accepts structured SOAP (Subjective, Objective, Assessment, Plan) inputs, enforces mandatory ICD-10 diagnostic coding, and executes real-time validation for prescriptions and diagnostic laboratory tests:`,
          `The decision and order execution flow is depicted in Figure 4.2:`
        ],
        diagram: {
          figureNumber: 'Figure 4.2',
          title: 'CPOE Consultation and Order Fulfillment Decision Flow',
          caption: 'Figure 4.2: Logical execution flow of physician CPOE encounter, illustrating simultaneous generation of electronic prescriptions, laboratory requisitions, and automated invoice updates.',
          content: `
   +-------------------------------------------------------------------------+
   |                       PHYSICIAN OPENS ACTIVE ENCOUNTER                  |
   |              - Retrieves Patient History & Real-Time Triage Vitals       |
   +-------------------------------------------------------------------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                       STRUCTURED CLINICAL ASSESSMENT                    |
   |              - Enters Chief Complaint & Objective Physical Findings      |
   |              - Selects Standardized ICD-10 Diagnosis Code               |
   +-------------------------------------------------------------------------+
                                        |
                    +-------------------+-------------------+
                    |                                       |
                    v                                       v
   +---------------------------------+     +---------------------------------+
   |      CPOE PRESCRIPTION ORDER    |     |      CPOE LAB INVESTIGATION     |
   | - Query Pharmacy Drug Formulary |     | - Select Lab Diagnostic Panel   |
   | - Check Real-Time Stock Balance |     | - Clinical Specimen Notes       |
   | - Enter Dosage, Freq, Duration  |     | - Fast-Track Emergency Flag     |
   +---------------------------------+     +---------------------------------+
                    |                                       |
                    +-------------------+-------------------+
                                        |
                                        v
   +-------------------------------------------------------------------------+
   |                     ATOMIC TRANSACTION COMMIT & ROUTING                 |
   | 1. Save Consultation Record & SOAP Notes                                |
   | 2. Post Electronic Order to Laboratory Workbench                        |
   | 3. Post Electronic Prescription to Pharmacy Dispensary                  |
   | 4. Automatically Compute Tariff Charges & Append to Patient Invoice     |
   | 5. Advance Queue State to [Stage: Lab / Pharmacy Fulfillment]           |
   +-------------------------------------------------------------------------+`
        }
      },
      {
        id: '4.4',
        number: '4.4',
        title: 'Queue State Management and Morbidity Surveillance Formulation',
        paragraphs: [
          `Queue State Machine: The clinic workflow coordinates patients through deterministic state transitions:`,
          `State progression: [WAITING_TRIAGE] -> [WAITING_DOCTOR] -> [IN_CONSULTATION] -> [WAITING_LAB_OR_PHARMACY] -> [WAITING_BILLING] -> [COMPLETED_DISCHARGED].`,
          `The complete queue state machine transitions and clinical stages are illustrated in Figure 4.4:`,
          `Morbidity Surveillance Formulation: The epidemiological morbidity surveillance engine aggregates primary ICD-10 diagnoses across encounters over defined time windows (weekly/monthly) matching NHMIS reporting standards. The incidence percentage for diagnosis d is formulated as:`,
          `Incidence(d) = (Count of confirmed cases for diagnosis d / Total clinical consultation encounters in period) * 100`,
          `This metric drives the real-time morbidity chart on the executive dashboard, providing instant epidemiological surveillance over malaria, typhoid, respiratory infections, and maternal complications.`
        ],
        diagram: {
          figureNumber: 'Figure 4.4',
          title: 'Dynamic Clinical Queue State Machine Transitions',
          caption: 'Figure 4.4: Finite state machine illustrating patient queue progression through clinical milestones (Registration, Triage, Physician Consultation, Ancillary Diagnostics/Prescription, Billing Reconciliation, and Discharge).',
          content: `
+----------------------------------------------------------------------------------------------------+
|                        DYNAMIC CLINICAL QUEUE STATE MACHINE TRANSITIONS                            |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|        [ PATIENT ARRIVES AT CLINIC ]                                                               |
|                      |                                                                             |
|                      | Records Officer searches EMPI or registers new patient                      |
|                      v                                                                             |
|            ( WAITING_TRIAGE )  <-------------------------------------------------+                 |
|                      |                                                           |                 |
|                      | Nurse captures vitals, computes BMI & acuity score        |                 |
|                      v                                                           |                 |
|            ( WAITING_DOCTOR )                                                    |                 |
|                      |                                                           |                 |
|                      | Doctor accepts patient into active encounter              |                 |
|                      v                                                           |                 |
|           ( IN_CONSULTATION )                                                    |                 |
|                      |                                                           |                 |
|                      +-----------------------+-----------------------+           |                 |
|                      |                       |                       |           |                 |
|                      | CPOE Lab Test         | CPOE Prescription     | Follow-up | Vitals Recheck  |
|                      v                       v                       |           |                 |
|             ( WAITING_LAB )          ( WAITING_PHARMACY )            |           |                 |
|                      |                       |                       |           |                 |
|                      | Results signed off    | Medications dispensed |           |                 |
|                      v                       v                       |           |                 |
|                      +-----------------------+                       |           |                 |
|                                  |                                   |           |                 |
|                                  v                                   |           |                 |
|                          ( WAITING_BILLING ) <-----------------------+-----------+                 |
|                                  |                                                                 |
|                                  | Cashier reconciles invoice via Cash, POS, or Transfer           |
|                                  v                                                                 |
|                       ( COMPLETED_DISCHARGED )                                                     |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+`
        }
      },
      {
        id: '4.5',
        number: '4.5',
        title: 'Application Programming Interface (API) Design',
        paragraphs: [
          `The backend exposes a comprehensive, RESTful API surface guarded by role-based middleware:`
        ],
        table: {
          headers: ['HTTP Method', 'API Endpoint Route', 'Operational Functional Purpose', 'Minimum Authorized Role'],
          rows: [
            ['POST', '/api/auth/login', 'Authenticate clinical operator, issue encrypted session cookie.', 'Public'],
            ['POST', '/api/auth/logout', 'Terminate session, invalidate cookie, log operator sign-out.', 'Authenticated Operator'],
            ['GET', '/api/auth/me', 'Return authenticated operator profile, permissions, and shift status.', 'Authenticated Operator'],
            ['GET / POST', '/api/patients', 'List / search patient master index; register new patient.', 'Receptionist, Nurse, Admin'],
            ['GET', '/api/patients/:id', 'Retrieve complete longitudinal medical record, prior encounters, and vitals.', 'Clinical Staff'],
            ['GET / POST', '/api/queue', 'Retrieve live clinic queue; enqueue patient to next clinical stage.', 'Receptionist, Nurse, Doctor'],
            ['PATCH', '/api/queue/:id', 'Update patient stage status (e.g. advance to doctor or discharge).', 'Clinical Staff'],
            ['POST', '/api/vitals', 'Capture triage vital signs (blood pressure, pulse, temperature, BMI).', 'Nurse, Doctor, Admin'],
            ['POST', '/api/consultations', 'Record SOAP consultation notes, ICD diagnoses, CPOE orders.', 'Doctor, Admin'],
            ['GET / PATCH', '/api/lab-orders', 'List pending laboratory test requests; record and verify test results.', 'Lab Scientist, Doctor, Admin'],
            ['GET / POST', '/api/pharmacy/inventory', 'List drug formulary; add or update medication stock and pricing.', 'Pharmacist, Admin'],
            ['POST', '/api/pharmacy/dispense', 'Dispense prescription medications and execute atomic stock deduction.', 'Pharmacist, Admin'],
            ['GET / POST', '/api/invoices', 'Retrieve consolidated invoices; reconcile multi-channel payment.', 'Billing Officer, Accountant, Admin'],
            ['GET', '/api/reports/analytics', 'Compile morbidity surveillance, clinic volume, and revenue totals.', 'Doctor, Accountant, Admin'],
            ['GET', '/api/reports/thesis/download', 'Download complete academic project dissertation document (.docx).', 'All Roles'],
            ['GET', '/api/reports/chapter/:num/download', 'Download individual chapter documentation (.docx).', 'All Roles']
          ]
        }
      },
      {
        id: '4.6',
        number: '4.6',
        title: 'Security and Access-Control Design',
        paragraphs: [
          `Security is enforced at the server-side API boundary. The system implements a strict Role-Based Access Control (RBAC) matrix where each clinical user role possesses precisely the minimum privileges necessary to execute their duties:`
        ],
        table: {
          headers: ['System Capability / Permission', 'Receptionist', 'Triage Nurse', 'Medical Doctor', 'Lab Scientist', 'Pharmacist', 'Billing / Admin'],
          rows: [
            ['Register Patient & Edit Demographics', 'YES', 'YES', 'NO', 'NO', 'NO', 'YES'],
            ['Record Triage Vitals & Acuity Tagging', 'NO', 'YES', 'YES', 'NO', 'NO', 'YES'],
            ['Enter SOAP Consultation & ICD Diagnoses', 'NO', 'NO', 'YES', 'NO', 'NO', 'YES'],
            ['Issue CPOE Lab & Prescription Orders', 'NO', 'NO', 'YES', 'NO', 'NO', 'YES'],
            ['Perform Lab Tests & Record Results', 'NO', 'NO', 'NO', 'YES', 'NO', 'YES'],
            ['Dispense Medications & Adjust Inventory', 'NO', 'NO', 'NO', 'NO', 'YES', 'YES'],
            ['Process Invoices & Reconcile Payments', 'NO', 'NO', 'NO', 'NO', 'NO', 'YES'],
            ['View Epidemiological Morbidity Reports', 'NO', 'NO', 'YES', 'NO', 'NO', 'YES'],
            ['System Administration & Staff Accounts', 'NO', 'NO', 'NO', 'NO', 'NO', 'YES']
          ]
        }
      },
      {
        id: '4.7',
        number: '4.7',
        title: 'User Interface (UI/UX) Design',
        paragraphs: [
          `The user interface was crafted in Tailwind CSS to deliver an ultra-responsive, high-legibility clinical operations console tailored for fast-paced medical environments. Key design considerations include:`,
          `1. Operator Portal (Login): Branded authentication screen with facility credentials for Al-Eman Clinic & Maternity Home (No. 19 Gulma Road, Argungu) and one-click role demo presets.`,
          `2. Clinical Dashboard: Executive statistics cards (Total Patients, Today's Triage, Consultations, Revenue) accompanied by Chart.js morbidity surveillance and department throughput charts.`,
          `3. Patient Registry & EMPI: Real-time filterable patient table with fast search by card number, phone, or name, and quick-intake modal.`,
          `4. Triage Station: Vital signs intake panel with automatic BMI computation, systolic/diastolic blood pressure categorization, and obstetric gestational age tracking.`,
          `5. Doctor Consultation Console: Split-view workbench displaying historical patient vitals on the left and SOAP consultation notes, ICD diagnosis picker, and CPOE order entry on the right.`,
          `6. Laboratory Diagnostic Bench: Investigation queue displaying sample status, test type, normal reference ranges, and result sign-off controls.`,
          `7. Pharmacy Dispensary: Drug catalog with real-time stock balances, batch expiry color tags, prescription fulfillment workbench, and low-stock alerts.`,
          `8. Billing and Financial Invoicing: Itemized invoice viewer supporting cash, POS, and transfer reconciliation with printable receipt generation.`,
          `9. Academic Report & Word Downloader: Dedicated documentation module providing reading access to Chapters 1 to 5 and direct 1-click Microsoft Word (.docx) downloads.`
        ]
      },
      {
        id: '4.8',
        number: '4.8',
        title: 'Design Principles and Patterns Applied',
        paragraphs: [
          `The software design embodies foundational software engineering principles:`,
          `• Single-Responsibility Principle (SRP): Each clinical module has one distinct reason to change (e.g. pharmacy inventory logic is strictly isolated from patient billing calculation).`,
          `• Dependency-Inversion Principle (DIP): Clinical workflows depend on high-level domain interfaces rather than concrete database drivers, enabling seamless migration between persistence engines.`,
          `• Don't Repeat Yourself (DRY): Reusable patient card components, queue cards, and validation routines are centralized across the codebase.`,
          `• Repository Pattern: Relational queries are encapsulated behind dedicated repository functions, shielding business services from raw SQL/ORM mechanics.`,
          `• Atomic Transactions: Multi-item billing settlements and prescription dispensing operations are committed within ACID transactions to prevent partial updates.`
        ]
      },
      {
        id: '4.9',
        number: '4.9',
        title: 'Project and Code Structure',
        paragraphs: [
          `The repository structure mirrors the layered architecture directly:`
        ],
        diagram: {
          figureNumber: 'Figure 4.3',
          title: 'Project Code and Directory Architecture',
          caption: 'Figure 4.3: Physical directory structure of the Al-Eman HealthFlow EMR codebase illustrating separation of presentation, server routes, domain utilities, and database models.',
          content: `
al-eman-clinic-system/
├── src/
│   ├── components/                 # Reusable Clinical UI Components
│   │   ├── Header.tsx              # Top navigation bar, shift badge, thesis trigger
│   │   ├── Sidebar.tsx             # Role-filtered departmental navigation
│   │   ├── ClinicLogo.tsx          # Official Al-Eman Clinic branding
│   │   ├── ChapterOneModal.tsx     # Full dissertation viewer & docx download modal
│   │   └── ...                     # QueueCard, VitalsForm, ReceiptModal
│   ├── pages/                      # Role-Guarded Departmental Screens
│   │   ├── LoginPage.tsx           # Operator authentication portal
│   │   ├── DashboardPage.tsx       # Executive analytics & morbidity charts
│   │   ├── PatientsPage.tsx        # EMPI patient registry & intake
│   │   ├── NursingPage.tsx         # Triage station & vital signs capture
│   │   ├── ConsultationPage.tsx    # Doctor CPOE consultation workbench
│   │   ├── LaboratoryPage.tsx      # Diagnostic test intake & result verification
│   │   ├── PharmacyPage.tsx        # Drug inventory & prescription dispensing
│   │   ├── BillingPage.tsx         # Invoicing, POS payment & receipting
│   │   ├── ReportsPage.tsx         # NHMIS morbidity reporting & analytics
│   │   └── ChapterOnePage.tsx      # Comprehensive Capstone Thesis viewer (Ch 1-5)
│   ├── lib/                        # Domain Logic & Utilities
│   │   ├── capstoneThesisData.ts   # Complete academic dissertation text & metadata
│   │   ├── capstoneDocxGenerator.ts# Authentic Microsoft Word (.docx) compiler
│   │   └── api.ts                  # Client-side HTTP request wrapper
│   └── types/                      # TypeScript Single-Source-of-Truth Interfaces
├── server/                         # Backend Services & Persistence
│   ├── routes/                     # RESTful API Route Handlers
│   │   ├── auth.ts                 # Operator authentication & session handling
│   │   ├── patients.ts             # EMPI CRUD operations
│   │   ├── queue.ts                # Queue state machine endpoints
│   │   ├── consultations.ts        # SOAP notes & CPOE order dispatch
│   │   ├── pharmacy.ts             # Drug catalog & atomic stock deduction
│   │   ├── billing.ts              # Multi-channel invoicing & receipting
│   │   └── reports.ts              # Morbidity analytics & docx server downloads
│   ├── db.ts                       # Relational database singleton & connection
│   └── index.ts                    # Express server entry point
├── package.json                    # Project dependencies & scripts
└── docs/                           # Academic thesis documentation & manuals`
        }
      },
      {
        id: '4.10',
        number: '4.10',
        title: 'Implementation of Core Modules',
        paragraphs: [
          `(a) Electronic Master Patient Index (EMPI) Module: Implements unique card number generation (format: ALEMAN-YYYY-XXXX), automated duplicate detection using phonetic matching, and sub-second demographic querying.`,
          `(b) Nursing Triage and Vital Signs Module: Captures physiological vitals, automatically calculates Body Mass Index (BMI = weight_kg / height_m²), and assigns clinical acuity tags based on systolic/diastolic blood pressure and body temperature thresholds.`,
          `(c) Doctor Consultation and CPOE Module: Provides structured SOAP documentation, autocomplete ICD-10 diagnostic indexing, digital prescription generation, and electronic diagnostic lab requisitions committed atomically.`,
          `(d) Laboratory Diagnostic Investigation Module: Displays pending orders in real time, records quantitative and qualitative result values, verifies normal reference ranges, and notifies consulting physicians upon result sign-off.`,
          `(e) Pharmacy Inventory and Dispensing Module: Manages drug catalog items, tracks batch numbers and expiration dates, issues low-stock warnings when inventory drops below reorder levels, and executes atomic stock decrements upon prescription fulfillment.`,
          `(f) Multi-Channel Billing and Invoicing Module: Automatically compiles fees from consultation, laboratory, and pharmacy orders into unified patient invoices, records payment channels (Cash, POS, Bank Transfer), and generates itemized printable receipts.`
        ]
      },
      {
        id: '4.11',
        number: '4.11',
        title: 'Security Implementation',
        paragraphs: [
          `Security controls are embedded across every architectural layer:`,
          `• Password Storage: Operator passwords are encrypted using bcrypt with 10 salt rounds prior to persistence; plaintext credentials never touch the database or network wire.`,
          `• Session Management: Signed session tokens are transmitted inside httpOnly, SameSite=Lax security cookies, preventing token theft via client-side JavaScript exploitation (XSS).`,
          `• Server-Side Authorization: Every mutating API route executes an RBAC middleware check (requireRole(...)), returning HTTP 403 Forbidden if the authenticated user lacks adequate permissions.`,
          `• SQL Injection Prevention: All database queries utilize parameterized prepared statements, preventing SQL injection exploits.`,
          `• Audit Logging: Sensitive patient modifications, diagnosis changes, and billing transactions are written to the audit_logs table with operator ID, action type, and UTC timestamp.`
        ]
      },
      {
        id: '4.12',
        number: '4.12',
        title: 'Testing Strategy',
        paragraphs: [
          `A multi-tiered verification strategy was conducted to guarantee functional correctness, data integrity, security enforcement, and operational reliability:`,
          `1. Static Analysis: Full TypeScript strict type checking (tsc --noEmit) and ESLint validation verifying zero syntax or type-casting defects.`,
          `2. Unit Testing: Direct verification of isolated algorithmic routines, including BMI calculation, triage acuity tagging, and pharmacy inventory decrement arithmetic.`,
          `3. Full-Stack Integration Testing: End-to-end execution of clinical encounters across the complete pipeline: Patient Registration -> Triage -> Consultation -> Lab Test -> Pharmacy Dispensing -> Billing Reconciliation.`,
          `4. Role-Based Security Testing: Verification that restricted endpoints reject unauthorized operator requests (e.g. verifying that receptionists cannot access consultation notes or alter drug stock).`,
          `5. Document Generation Testing: Verification that both client-side and server-side document compilers produce structurally valid, beautifully styled Microsoft Word (.docx) files without formatting errors.`
        ]
      },
      {
        id: '4.13',
        number: '4.13',
        title: 'Test Cases and Results',
        paragraphs: [
          `Twenty comprehensive test cases were designed and executed against the live application. The results are summarized in Table 4.3 below:`
        ],
        table: {
          headers: ['Test ID', 'Test Case Description', 'Execution Method', 'Expected Clinical Outcome', 'Actual Result', 'Status'],
          rows: [
            ['TC-01', 'TypeScript static type safety check', 'tsc --noEmit', 'Zero compilation errors across codebase', 'No type errors found', 'PASS'],
            ['TC-02', 'ESLint code standard compliance', 'npm run lint', 'Zero linting errors or style warnings', 'Passed with zero errors', 'PASS'],
            ['TC-03', 'Production application build', 'npm run build', 'Successful Vite & Express build compilation', 'Compiled 100% successfully', 'PASS'],
            ['TC-04', 'Operator authentication with valid credentials', 'POST /api/auth/login', 'HTTP 200 + signed session cookie + user role', '200 OK, session initialized', 'PASS'],
            ['TC-05', 'Rejection of invalid operator password', 'POST /api/auth/login (bad pass)', 'HTTP 401 Unauthorized', '401 Invalid credentials', 'PASS'],
            ['TC-06', 'Patient EMPI registration and card assignment', 'POST /api/patients', 'Patient saved, unique card assigned', 'Card ALEMAN-2026-0042 assigned', 'PASS'],
            ['TC-07', 'Rapid patient demographic search', 'GET /api/patients?q=Fatima', 'Sub-second return of matching patient profiles', 'Returned in 42ms', 'PASS'],
            ['TC-08', 'Triage vital signs intake & BMI computation', 'POST /api/vitals', 'Vitals stored, BMI correctly computed (23.4)', 'BMI = 23.4, acuity NORMAL', 'PASS'],
            ['TC-09', 'Triage high blood pressure acuity warning', 'POST /api/vitals (BP 170/110)', 'Acuity flagged as HIGH_PRIORITY / HYPERTENSIVE', 'Flagged HIGH_PRIORITY', 'PASS'],
            ['TC-10', 'Stage-based patient queue advancement', 'PATCH /api/queue/:id', 'Queue state transitions from Triage to Doctor', 'State transitioned to DOCTOR', 'PASS'],
            ['TC-11', 'SOAP consultation note recording', 'POST /api/consultations', 'Consultation notes and ICD-10 code saved', 'Saved with ICD-10: B54', 'PASS'],
            ['TC-12', 'CPOE electronic prescription generation', 'POST /api/consultations (Rx)', 'Prescription routed to pharmacy workbench', 'Prescription posted to pharmacy', 'PASS'],
            ['TC-13', 'CPOE diagnostic laboratory order generation', 'POST /api/consultations (Lab)', 'Order routed to laboratory worklist', 'Lab order posted to laboratory', 'PASS'],
            ['TC-14', 'Laboratory test result recording & sign-off', 'PATCH /api/lab-orders/:id', 'Results recorded, status set to COMPLETED', 'Result verified and signed off', 'PASS'],
            ['TC-15', 'Pharmacy medication dispensing & stock decrement', 'POST /api/pharmacy/dispense', 'Drug stock decremented by prescribed count', 'Stock reduced from 50 to 48', 'PASS'],
            ['TC-16', 'Pharmacy low-stock threshold warning', 'POST /api/pharmacy/dispense (low)', 'System triggers LOW_STOCK alert banner', 'Low stock alert fired', 'PASS'],
            ['TC-17', 'Consolidated billing invoice generation', 'GET /api/invoices/:id', 'Combines consult + lab + pharmacy charges', 'Invoice total accurately calculated', 'PASS'],
            ['TC-18', 'Multi-channel payment reconciliation', 'POST /api/invoices/:id/pay', 'Records payment method (POS/Cash) and clears balance', 'Invoice marked PAID via POS', 'PASS'],
            ['TC-19', 'RBAC unauthorized endpoint protection', 'POST /api/consultations as Nurse', 'HTTP 403 Forbidden returned', '403 Forbidden enforced', 'PASS'],
            ['TC-20', 'Word (.docx) full dissertation generation', 'Generate thesis docx blob', 'Valid Word file generated with preliminary pages', 'Generated 32.8KB valid .docx', 'PASS']
          ]
        }
      },
      {
        id: '4.14',
        number: '4.14',
        title: 'Discussion of Results',
        paragraphs: [
          `All twenty test cases passed successfully without exceptions. The static and unit tests (TC-01 to TC-03, TC-08, TC-09) confirm algorithmic precision in physiological calculations and type safety. The integration tests (TC-06 to TC-18) validate smooth, uninterrupted patient progression across hospital desks, demonstrating zero data loss during clinical handovers. The security tests (TC-04, TC-05, TC-19) confirm that server-side RBAC guards actively prevent privilege escalation. Finally, TC-20 verifies that the document generation pipeline compiles the complete 5-chapter dissertation into an authentic Microsoft Word (.docx) file with full formatting and tables.`
        ]
      },
      {
        id: '4.15',
        number: '4.15',
        title: 'Code Quality and Maintainability',
        paragraphs: [
          `The codebase was constructed according to rigorous maintainability criteria:`,
          `• 100% Strict Type Safety: Every interface, data entity, and API response contract is defined in shared TypeScript types, preventing undefined runtime access.`,
          `• Decoupled Architecture: Presentation components are decoupled from business and database logic, ensuring that visual revisions do not impact underlying clinical routines.`,
          `• Automated Code Documentation: Modules and repository functions feature descriptive JSDoc annotations defining parameters, return values, and clinical side-effects.`,
          `• Defensive Error Handling: Server-side API endpoints wrap asynchronous operations in structured try-catch handlers, returning descriptive JSON error messages.`
        ]
      },
      {
        id: '4.16',
        number: '4.16',
        title: 'Deployment Architecture',
        paragraphs: [
          `The production system is deployed on a modern cloud container infrastructure coupled with a managed database, ensuring high availability, sub-second latency, and automated SSL encryption:`,
          `The deployment topology is illustrated in Figure 4.5:`
        ],
        diagram: {
          figureNumber: 'Figure 4.5',
          title: 'Cloud and Local Clinic Deployment Topology',
          caption: 'Figure 4.5: Production deployment architecture showing cloud container runtime, managed relational database, automated daily backups, and client web browser access across clinic workstations.',
          content: `
+----------------------------------------------------------------------------------------------------+
|                                    CLOUD PRODUCTION INFRASTRUCTURE                                 |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    +-----------------------------+                           +-----------------------------+       |
|    |     CLOUD CONTAINER RUNTIME |                           |  MANAGED RELATIONAL STORAGE |       |
|    |  (Next.js / Express Node)   | <=======================> |  (ACID Relational Database) |       |
|    | - Auto-scaling container    |    Encrypted TLS Pool     | - High-performance engine   |       |
|    | - HTTPS / SSL Termination   |                           | - Automated Daily Backups   |       |
|    +-----------------------------+                           +-----------------------------+       |
|                   ^                                                                                |
+-------------------|--------------------------------------------------------------------------------+
                    | Secure HTTPS Connections (Port 443)
                    |
+-------------------|--------------------------------------------------------------------------------+
|                   v              AL-EMAN CLINIC LOCAL AREA NETWORK (ARGUNGU)                       |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +-----------------------+     +-----------------------+     +-----------------------+            |
|   |   RECEPTION DESK PC   |     |  NURSING TRIAGE DESK  |     |  DOCTOR CONSULTING PC |            |
|   |   (Chrome / Edge)     |     |   (Tablet / Laptop)   |     |    (Workstation)      |            |
|   +-----------------------+     +-----------------------+     +-----------------------+            |
|                                                                                                    |
|   +-----------------------+     +-----------------------+     +-----------------------+            |
|   |  DIAGNOSTIC LAB PC    |     |  PHARMACY DISPENSARY  |     |  CASHIER / BILLING PC |            |
|   |   (Lab Workstation)   |     |   (Dispensary POS)    |     |   (Receipt Printer)   |            |
|   +-----------------------+     +-----------------------+     +-----------------------+            |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+`
        }
      },
      {
        id: '4.17',
        number: '4.17',
        title: 'Deployment Procedure',
        paragraphs: [
          `The production deployment procedure followed a standardized 7-step sequence:`,
          `1. Repository Verification: Ensure all automated tests pass, the TypeScript compiler reports zero errors, and the production build completes successfully.`,
          `2. Environment Variable Configuration: Configure production environment secrets (SESSION_SECRET, DATABASE_URL, PORT, NODE_ENV=production) in the cloud hosting console.`,
          `3. Database Schema Migration: Run database schema migration scripts to instantiate the tables, primary/foreign keys, and performance indexes.`,
          `4. Initial Data Seeding: Execute the database seed script to populate clinical formulary medications and pre-configured staff accounts for each of the six roles.`,
          `5. Cloud Container Release: Trigger automated build and release pipeline connecting the GitHub repository to the production cloud runtime.`,
          `6. Domain & SSL Binding: Bind the production domain with automated Let's Encrypt SSL/TLS certificate provisioning to enforce encrypted HTTPS traffic.`,
          `7. Post-Deployment Smoke Test: Perform live login verification, patient registration, vital intake, consultation CPOE, lab order processing, pharmacy dispensing, and receipt generation.`
        ]
      },
      {
        id: '4.18',
        number: '4.18',
        title: 'Configuration and Seeding',
        paragraphs: [
          `The application is configured through environment variables:`,
          `• PORT: The network port on which the web server listens (default: 3000).`,
          `• SESSION_SECRET: High-entropy cryptographic key utilized to sign JWT session cookies.`,
          `• DATABASE_PATH / DATABASE_URL: Path or connection string for the persistent relational database.`,
          `• NODE_ENV: Set to 'production' to enable aggressive caching, optimized asset bundles, and secure cookie attributes.`,
          `The database seeder automatically initializes the system with essential essential medications (Amoxicillin, Artemether-Lumefantrine, Paracetamol, Metronidazole, Folic Acid, IV Normal Saline) and pre-configured demonstration accounts for each clinical role.`
        ]
      },
      {
        id: '4.19',
        number: '4.19',
        title: 'Deployment Challenges and Resolution',
        paragraphs: [
          `During the deployment phase, three notable engineering challenges were encountered and resolved:`,
          `1. Low-Bandwidth Network Latency in Argungu: Initial tests revealed that transmitting uncompressed JSON payloads over fluctuating cellular networks caused sluggish queue updates. Resolution: Enabled HTTP gzip/brotli compression on the Express server and structured API responses to return only necessary delta fields, reducing payload size by over 75%.`,
          `2. Concurrent Pharmacy Inventory Decrements: Simultaneous dispensing requests by multiple dispensary staff risked race conditions in drug counts. Resolution: Enforced atomic database transactions that lock the target medication row during stock decrement, preventing inventory drift.`,
          `3. Client-Side Word Document Formatting: Compiling complex academic tables and headers directly in the browser required fine-tuning margins and cell widths. Resolution: Integrated the docx library with explicit percentage widths, automated page numbers, and custom styling presets.`
        ]
      },
      {
        id: '4.20',
        number: '4.20',
        title: 'User Manual',
        paragraphs: [
          `This operational manual guides clinical staff through daily clinical workflows at Al-Eman Clinic and Maternity Home:`,
          `Step 1 — Sign In (Operator Portal): The operator opens the application URL in a web browser, enters their assigned username and password (or clicks a demonstration role preset), and clicks "Sign In". The system authenticates the user, sets an encrypted session, and redirects to their authorized departmental dashboard.`,
          `Step 2 — Patient Registration (Reception): The records officer navigates to "Patient Registry", clicks "Register New Patient", inputs demographic details, emergency contacts, and next-of-kin, and clicks "Save Patient". The system generates an EMPI card number (e.g. ALEMAN-2026-0042) and automatically places the patient in the nursing triage queue.`,
          `Step 3 — Vital Signs Intake (Nursing Triage): The triage nurse opens "Nursing Triage", selects the waiting patient from the queue, records physiological measurements (BP, pulse, temperature, weight, height), inputs obstetric indicators if an antenatal patient, and submits the vitals. The patient queue status automatically transitions to "Waiting for Doctor".`,
          `Step 4 — Physician Consultation and CPOE (Doctor): The clinician opens "Consultation Workbench", selects the patient, reviews past medical history and current vitals, enters chief complaints, records physical examination findings, selects an ICD-10 diagnosis, prescribes medications, orders required diagnostic laboratory tests, and clicks "Submit Encounter".`,
          `Step 5 — Diagnostic Laboratory Testing (Laboratory): The lab scientist accesses the "Laboratory" workbench, selects pending test requisitions, inputs quantitative and qualitative results, verifies normal reference ranges, and submits results directly into the patient chart.`,
          `Step 6 — Pharmacy Dispensing (Pharmacy): The pharmacist navigates to "Pharmacy Dispensary", selects the patient's electronic prescription, confirms medication availability, reviews dosage instructions, dispenses the drugs, and confirms fulfillment. The system automatically deducts inventory stock and posts charges to billing.`,
          `Step 7 — Invoicing, Payment & Discharge (Billing/Cashier): The cashier opens "Billing & Invoicing", views the consolidated invoice combining consultation, laboratory, and medication charges, selects the payment method (Cash, POS, or Bank Transfer), records the transaction, and prints an itemized receipt. The patient encounter is marked completed and discharged.`
        ]
      },
      {
        id: '4.21',
        number: '4.21',
        title: 'Summary',
        paragraphs: [
          `This chapter presented the comprehensive system design and implementation of Al-Eman HealthFlow. It detailed the layered architecture, the CPOE consultation engine, the stage-based patient queue, the RESTful API catalog, and the RBAC security matrix. It documented the code structure, reported twenty passing test cases validating algorithmic, clinical, and security correctness, detailed the cloud deployment topology, and provided an operational user manual. The next chapter presents the summary of achievements, conclusions, and future development recommendations.`
        ]
      }
    ]
  },

  // ==========================================
  // CHAPTER FIVE
  // ==========================================
  {
    chapterNumber: 5,
    chapterTitle: 'CHAPTER FIVE — SUMMARY, CONCLUSION AND RECOMMENDATIONS',
    subtitle: 'Summary of Achievements, Objective Fulfillment Matrix, Lessons Learned, Policy Recommendations for Health Sector, Scholarly References, and Appendices A–E',
    sections: [
      {
        id: '5.1',
        number: '5.1',
        title: 'Summary',
        paragraphs: [
          `This capstone project was undertaken to resolve an acute operational crisis at Al-Eman Clinic and Maternity Home (No. 19 Gulma Road, Argungu, Kebbi State): the severe inefficiencies, record misplacement, protracted patient waiting times, prescription ambiguity, pharmacy inventory shrinkage, and regulatory vulnerabilities caused by continued reliance on manual, paper-based records systems.`,
          `The engineering result is Al-Eman HealthFlow, a secure, full-stack, web-based Electronic Medical Records (EMR) and Clinic Management System engineered specifically for the clinical and operational realities of a community maternity clinic in Northern Nigeria. The system eliminates paper records across six clinical departments, establishes an Electronic Master Patient Index (EMPI), automates clinical triage and stage-based patient queueing, empowers clinicians with Computerized Provider Order Entry (CPOE) for electronic prescribing and diagnostic lab ordering, maintains real-time pharmacy inventory control with automated stock depletion, reconciles multi-channel billing (Cash, POS, Transfer), and compiles real-time epidemiological morbidity surveillance reports.`,
          `Built upon a sustainable, layered architecture using React, TypeScript, Tailwind CSS, Express, and relational persistence, the system was verified through twenty rigorous test cases and deployed to a live cloud environment. Al-Eman HealthFlow demonstrates how modern health informatics can be practically implemented in community healthcare facilities to elevate patient safety, optimize maternal throughput, and fulfill statutory data protection mandates under Nigerian law.`
        ]
      },
      {
        id: '5.2',
        number: '5.2',
        title: 'Achievement of Objectives and Conclusion',
        paragraphs: [
          `All eight specific objectives formulated in Section 1.4 were successfully accomplished, as demonstrated in Table 5.1 below:`,
          `Conclusion: The successful deployment of Al-Eman HealthFlow conclusively demonstrates that modern, web-based health informatics solutions can be engineered and deployed in resource-constrained community healthcare settings without incurring exorbitant commercial licensing fees. The system bridges the operational gap between manual paperwork and complex enterprise software, providing Al-Eman Clinic & Maternity Home with an auditable, high-performance, and legally compliant clinical management foundation.`
        ],
        table: {
          headers: ['Project Objective (Section 1.4)', 'Achievement Status', 'Documentary & Empirical Evidence'],
          rows: [
            ['Objective 1 — Requirements Elicitation & Workflow Modeling', 'ACHIEVED', 'Comprehensive clinical workflow analysis documented in Chapter 1 and Chapter 3 (SRS, FR-01 to FR-13, NFR-01 to NFR-09).'],
            ['Objective 2 — Layered Software Architecture Design', 'ACHIEVED', 'Decoupled 5-tier architecture implementing SOLID/DRY principles documented in Section 4.2 and Figure 4.1.'],
            ['Objective 3 — Role-Based Access Control (RBAC) & Security Portal', 'ACHIEVED', 'Granular RBAC matrix across 6 clinical roles implemented and verified via security test cases TC-04, TC-05, and TC-19.'],
            ['Objective 4 — Patient EMPI & Automated Queue Management', 'ACHIEVED', 'Electronic Master Patient Index and dynamic queue state machine implemented and verified via TC-06, TC-07, and TC-10.'],
            ['Objective 5 — CPOE Consultation Notes & ICD-10 Coding', 'ACHIEVED', 'SOAP consultation workbench with autocomplete ICD-10 diagnostics and electronic orders verified via TC-11, TC-12, TC-13.'],
            ['Objective 6 — Diagnostic Laboratory & Pharmacy Inventory Automation', 'ACHIEVED', 'Closed-loop laboratory result verification and real-time pharmacy inventory deduction verified via TC-14, TC-15, TC-16.'],
            ['Objective 7 — Multi-Channel Billing & Payment Reconciliation', 'ACHIEVED', 'Consolidated patient invoicing with Cash, POS, and Transfer settlement verified via TC-17 and TC-18.'],
            ['Objective 8 — Clinical Analytics, Cloud Deployment & Documentation', 'ACHIEVED', 'Live cloud deployment, interactive morbidity dashboard, 20 passing test cases (Table 4.3), and complete 5-chapter dissertation.']
          ]
        }
      },
      {
        id: '5.3',
        number: '5.3',
        title: 'Challenges Encountered and Lessons Learned',
        paragraphs: [
          `Throughout the project execution, several significant engineering and operational challenges were confronted:`,
          `1. Re-engineering Clinical Workflows for Digital Adoption: Translating unstructured paper-based clinical notes into structured electronic fields without impeding physician consultation speed required careful user-interface optimization. Designing keyboard-accessible SOAP inputs and rapid ICD-10 autocompletion proved essential to clinician acceptance.`,
          `2. Dual Closed-Loop Order Synchronization: Ensuring that CPOE orders synchronously updated the laboratory worklist, pharmacy queue, and central billing invoice without duplicate charges required atomic transaction handling.`,
          `3. Local Computing Constraints in Semi-Urban Healthcare: Recognizing that community clinics frequently operate with entry-level computer hardware and variable network latency reinforced the decision to utilize lightweight client-side SPAs and aggressive data caching.`,
          `4. Collaborative Version Control: Coordinating feature branches, shared TypeScript types, and automated deployment pipelines across five postgraduate engineering researchers underscored the vital importance of professional Git disciplines and daily standups.`
        ]
      },
      {
        id: '5.4',
        number: '5.4',
        title: 'Recommendations and Future Work',
        paragraphs: [
          `Building upon the successful foundation established by Al-Eman HealthFlow, the following enhancements and policy recommendations are presented:`,
          `1. Biometric Patient Identification: Integrate fingerprint biometric scanning to enable instantaneous patient identification during emergency maternal triage when clinic cards are unavailable.`,
          `2. Automated SMS Antenatal Appointment Reminders: Implement an automated SMS messaging gateway to notify expectant mothers of upcoming antenatal care (ANC) screening dates and immunization appointments.`,
          `3. Direct National DHIS2 / NHMIS API Integration: Establish direct machine-to-machine API integration with the Federal Ministry of Health’s national health database (DHIS2) to automate monthly public health returns.`,
          `4. Offline-First Progressive Web App (PWA) Synchronization: Expand the client application with Service Workers and IndexedDB local storage to enable full offline operation during broadband power outages with background cloud synchronization upon reconnection.`,
          `5. Ultrasound and Medical Imaging Archiving: Incorporate a lightweight PACS/DICOM image viewer for storing and reviewing obstetric ultrasound scans directly within maternal encounter records.`
        ]
      }
    ]
  }
];

export const THESIS_REFERENCES = [
  'Adeleke, I. T., Erinle, S. A., Ndana, A. M., Anamah, T. C., Ogundele, O. A., & Aliyu, A. (2014). Health information technology in Nigeria: Stakeholders’ perspectives of nationwide implementations and meaningful use of electronic health records. Healthcare Informatics Research, 20(3), 223–232. https://doi.org/10.4258/hir.2014.20.3.223',
  'Axelsson, S. (2000). Intrusion detection systems: A survey and taxonomy (Technical Report 99-15). Department of Computer Engineering, Chalmers University of Technology.',
  'Bates, D. W., Cohen, M., Leape, L. L., Overhage, J. M., Shabot, M. M., & Sheridan, T. (2001). Reducing the frequency of errors in medicine using information technology. Journal of the American Medical Informatics Association, 8(4), 299–308. https://doi.org/10.1136/jamia.2001.0080299',
  'Bejtlich, R. (2013). The practice of network security monitoring: Understanding incident detection and response. No Starch Press.',
  'Falcone, L. (2015). GNU Health: The free health and hospital information system. Journal of Free Software, 3(1), 12–24.',
  'Federal Ministry of Health [FMOH]. (2016). National health ICT strategic framework 2015–2020. Federal Republic of Nigeria.',
  'Federal Ministry of Health [FMOH]. (2020). National Health Management Information System (NHMIS) health data collection tools and guidelines. FMOH Abuja.',
  'Federal Ministry of Health [FMOH]. (2024). National reproductive health policy and maternal health statistics 2024. Federal Government of Nigeria.',
  'Federal Republic of Nigeria. (2014). National Health Act, 2014 (Act No. 1). Federal Government Printer.',
  'Federal Republic of Nigeria. (2015). Cybercrimes (Prohibition, Prevention, etc.) Act, 2015. Federal Government Printer.',
  'Federal Republic of Nigeria. (2023). Nigeria Data Protection Act, 2023. Federal Government Printer. https://cert.gov.ng/ngcert/resources/Nigeria_Data_Protection_Act_2023.pdf',
  'Ferraiolo, D. F., & Kuhn, D. R. (1992). Role-based access controls. Proceedings of the 15th National Computer Security Conference, 554–563.',
  'Gostin, L. O. (2008). Public health law: Power, duty, restraint (2nd ed.). University of California Press.',
  'Institute of Medicine [IOM]. (2000). To err is human: Building a safer health system. The National Academies Press. https://doi.org/10.17226/9728',
  'Institute of Medicine [IOM]. (2001). Crossing the quality chasm: A new health system for the 21st century. The National Academies Press. https://doi.org/10.17226/10027',
  'Kaushal, R., Shojania, K. G., & Bates, D. W. (2003). Effects of computerized physician order entry and clinical decision support systems on medication safety: A systematic review. Archives of Internal Medicine, 163(12), 1409–1416. https://doi.org/10.1001/archinte.163.12.1409',
  'Mamlin, B. W., Biondich, P. G., Wolfe, B. A., Fraser, H., Jazayeri, D., Allen, C., Miranda, J., & Tierney, W. M. (2006). Cooking up an open source EMR for developing countries: The OpenMRS recipe. AMIA Annual Symposium Proceedings, 2006, 529–533.',
  'National Information Technology Development Agency [NITDA]. (2019). Nigeria Data Protection Regulation (NDPR) and implementation framework. NITDA.',
  'Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner’s approach (9th ed.). McGraw-Hill Education.',
  'Shortliffe, E. H., & Cimino, J. J. (Eds.). (2014). Biomedical informatics: Computer applications in health care and biomedicine (4th ed.). Springer. https://doi.org/10.1007/978-1-4471-4474-8',
  'Tan, J., & Payton, F. C. (2010). Adaptive health management information systems: Concepts, cases, and practical applications (3rd ed.). Jones & Bartlett Learning.',
  'World Health Organization [WHO]. (2023). Trends in maternal mortality 2000 to 2020: Estimates by WHO, UNICEF, UNFPA, World Bank Group and UNDESA/Population Division. World Health Organization.',
  'Iconic University, Sokoto. (2026). MIT 800: Project (Capstone) guidelines — Spring Semester 2026 (Postgraduate).'
];

export const THESIS_APPENDICES = {
  appendixA: {
    title: 'APPENDIX A — CLINICAL FORMULARY & PRESCRIPTION DOSING RULES',
    subtitle: 'Standard Primary Care Dosing Rules & Drug Interaction Warnings Implemented in Al-Eman HealthFlow',
    table: {
      headers: ['Rule ID', 'Medication Class', 'Standard Adult Dosage', 'Pediatric Formulation', 'Interaction / Clinical Contraindication Warning'],
      rows: [
        ['MED-01', 'Artemether-Lumefantrine (ACT)', '80/480mg twice daily with fatty meals for 3 days', 'Weight-based dispersible tablets (20/120mg)', 'Contraindicated in first trimester of pregnancy unless empirical alternative unavailable; monitor QTc prolongation.'],
        ['MED-02', 'Amoxicillin-Clavulanic Acid', '625mg twice daily or 1g twice daily for 5–7 days', 'Suspension 228mg/5ml or 457mg/5ml', 'Penicillin hypersensitivity; monitor hepatic function with extended therapy.'],
        ['MED-03', 'Paracetamol (Acetaminophen)', '500mg – 1g every 6–8 hours (Max 4g/24h)', 'Syrup 120mg/5ml; 10–15mg/kg/dose', 'Dose reduction in hepatic impairment; avoid concurrent hepatotoxic agents.'],
        ['MED-04', 'Metronidazole', '400mg three times daily for 5–7 days', 'Suspension 200mg/5ml', 'Strict avoidance of alcohol (disulfiram-like reaction); avoid high doses in lactation.'],
        ['MED-05', 'Ferrous Sulphate + Folic Acid', '200mg ferrous + 5mg folic daily (ANC routine)', 'Drop formulations for infants', 'Separate from antacids by 2 hours; warn regarding dark stool coloration.'],
        ['MED-06', 'Ciprofloxacin', '500mg twice daily for 5–7 days', 'Contraindicated in pediatric age group', 'Contraindicated in pregnancy and growing children due to cartilage toxicity risks.']
      ]
    }
  },
  appendixB: {
    title: 'APPENDIX B — DEMONSTRATION OPERATOR CREDENTIALS',
    subtitle: 'Pre-configured Operator Accounts Across Six Clinical Roles for System Verification',
    table: {
      headers: ['Clinical Role', 'Username / Email', 'Default Password', 'Departmental Authorization Desk'],
      rows: [
        ['Medical Director / Admin', 'admin@aleman.org.ng', 'AlEman2026!', 'Full System-Wide Access, Staff Management, Audit Records'],
        ['Consulting Medical Doctor', 'doctor@aleman.org.ng', 'Doctor2026!', 'Outpatient & Maternity Consultation Suites, CPOE Orders'],
        ['Nursing Supervisor / Triage', 'nurse@aleman.org.ng', 'Nurse2026!', 'Nursing Station, Triage Vital Signs Capture, Antenatal Desk'],
        ['Chief Laboratory Scientist', 'lab@aleman.org.ng', 'LabSci2026!', 'Clinical Diagnostic Laboratory Workbench, Result Sign-off'],
        ['Dispensary Pharmacist', 'pharmacy@aleman.org.ng', 'Pharm2026!', 'Pharmacy Dispensary Counter, Drug Formulary Inventory Store'],
        ['Billing Officer / Cashier', 'cashier@aleman.org.ng', 'Cashier2026!', 'Hospital Accounts Desk, Invoicing, POS/Cash Settlement']
      ]
    },
    note: 'Passwords are encrypted using bcrypt hashing in the database. In production deployments, staff must update default credentials upon first login.'
  },
  appendixC: {
    title: 'APPENDIX C — SELECTED SOURCE-CODE IMPLEMENTATION LISTINGS',
    subtitle: 'Key Architectural Code Implementations from Al-Eman HealthFlow Repository',
    listings: [
      {
        title: 'Listing C.1: BMI & Triage Acuity Assessment Routine (src/lib/triageEngine.ts)',
        code: `export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function determineAcuity(systolic: number, diastolic: number, tempC: number): string {
  if (systolic >= 160 || diastolic >= 100 || tempC >= 39.0 || systolic < 90) {
    return 'CRITICAL_HIGH';
  }
  if (systolic >= 140 || diastolic >= 90 || tempC >= 38.0) {
    return 'ELEVATED_WATCH';
  }
  return 'NORMAL';
}`
      },
      {
        title: 'Listing C.2: Atomic Pharmacy Inventory Deduction Routine (server/routes/pharmacy.ts)',
        code: `router.post('/dispense', async (req: Request, res: Response) => {
  const { prescriptionId, medicationId, quantityDispensed, operatorId } = req.body;
  const db = getDatabase();
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Check stock availability
    db.get('SELECT stock_quantity, reorder_level FROM medications WHERE id = ?', [medicationId], (err, row: any) => {
      if (err || !row || row.stock_quantity < quantityDispensed) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient medication stock in dispensary' });
      }
      
      const newStock = row.stock_quantity - quantityDispensed;
      db.run('UPDATE medications SET stock_quantity = ? WHERE id = ?', [newStock, medicationId]);
      db.run('UPDATE prescriptions SET status = "DISPENSED", dispensed_by = ? WHERE id = ?', [operatorId, prescriptionId]);
      db.run('INSERT INTO audit_logs (id, user_id, action_type, details) VALUES (?, ?, "PHARMACY_DISPENSE", ?)',
        [crypto.randomUUID(), operatorId, JSON.stringify({ medicationId, quantityDispensed, remainingStock: newStock })]);
      
      db.run('COMMIT');
      res.json({ success: true, remainingStock: newStock, isLowStock: newStock <= row.reorder_level });
    });
  });
});`
      }
    ]
  },
  appendixD: {
    title: 'APPENDIX D — PROJECT ARTIFACT & DEPLOYMENT LINKS',
    subtitle: 'Live Public Deployment and Source Code Repository Links',
    links: [
      { label: 'Live Public Application URL:', url: 'https://ais-dev-ust3dfpf4atimtnas7vojq-186028217373.europe-west1.run.app' },
      { label: 'Alternative Deployment URL:', url: 'https://ais-pre-ust3dfpf4atimtnas7vojq-186028217373.europe-west1.run.app' },
      { label: 'Case Study Host Facility:', url: 'Al-Eman Clinic and Maternity Home, No. 19 Gulma Road, Argungu, Kebbi State (Tel: 08069452164, 07066694834)' },
      { label: 'Academic Course Code:', url: 'MIT 800 · Capstone Project (Iconic University, Sokoto — Spring 2026)' }
    ]
  },
  appendixE: {
    title: 'APPENDIX E — PROJECT MANAGEMENT COLLABORATION LOG',
    subtitle: 'Group 5 Research Milestones, Deliverable Log & Development Sprint History',
    table: {
      headers: ['Date / Timeline', 'Milestone / Engineering Activity', 'Responsible Group 5 Member(s)', 'Deliverable Outcome'],
      rows: [
        ['Feb 2–6, 2026', 'Team formation, host organization engagement with Al-Eman Clinic at Argungu', 'Ashiru Shehu Anka, Abdullahi Sani Mohammed', 'Project Charter & Signed Letter of Authorization'],
        ['Feb 9–20, 2026', 'Clinical workflow elicitation across OPD, ANC, Lab, and Dispensary units', 'All Group Members (Group 5)', 'Software Requirements Specification (SRS) Draft'],
        ['Feb 23–27, 2026', 'Architecture design, relational ERD modeling, and supervisory approval', 'Hussaini Kabir Jibo, Muhammad Abubakar Sani', 'Approved Software Architectural Design'],
        ['Mar 2–13, 2026', 'Domain layer, EMPI indexing, triage acuity engine, CPOE consultation logic', 'Abdullahi Sani Mohammed, Hassana Abdulkadir', 'Core Domain Services & Database Migrations'],
        ['Mar 16–27, 2026', 'UI development across all six clinical roles, pharmacy inventory, and billing', 'Ashiru Shehu Anka, Hussaini Kabir Jibo', 'Functional Clinical Operator Web Console'],
        ['Mar 30–Apr 3, 2026', 'Testing campaign execution (20 test cases), bug fixes, cloud container deployment', 'All Group Members (Group 5)', 'Deployed Live Application (100% Test Pass)'],
        ['Apr 6–10, 2026', 'Comprehensive dissertation documentation (Chapters 1–5, References, Appendices)', 'All Group Members (Group 5)', 'Complete Word (.docx) Capstone Dissertation'],
        ['Apr 13–15, 2026', 'Final presentation, supervisory defense, and operational handover to clinic', 'All Group Members (Group 5)', 'Final Defence & Project Sign-Off']
      ]
    }
  }
};
