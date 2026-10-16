import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Building2,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Layers,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import {
  THESIS_METADATA,
  PRELIMINARY_PAGES,
  THESIS_CHAPTERS,
  THESIS_REFERENCES,
  THESIS_APPENDICES,
  ThesisChapter
} from '../lib/capstoneThesisData';
import {
  downloadThesisDocument
} from '../lib/capstoneDocxGenerator';

export const ChapterOnePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'prelim', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'refs', 'appendices'
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getActiveChapterNum = (): number | undefined => {
    if (activeTab === 'ch1') return 1;
    if (activeTab === 'ch2') return 2;
    if (activeTab === 'ch3') return 3;
    if (activeTab === 'ch4') return 4;
    if (activeTab === 'ch5') return 5;
    return undefined; // All chapters
  };

  const handleDownloadWord = async (chNum?: number) => {
    try {
      setDownloading(true);
      await downloadThesisDocument(chNum);
    } catch (err) {
      console.error('Failed to download Word document:', err);
      alert('Could not compile Word document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = async () => {
    try {
      let fullText = `${THESIS_METADATA.university}\n${THESIS_METADATA.universitySub}\n\n${THESIS_METADATA.projectTitle}\n\nBY GROUP 5 (${THESIS_METADATA.specialization}):\n`;
      for (const m of THESIS_METADATA.authors) {
        fullText += `• ${m.name} — ${m.regNo}\n`;
      }
      fullText += `\nSupervisor: ${THESIS_METADATA.supervisor}\nSession: ${THESIS_METADATA.session}\nHost Organization: ${THESIS_METADATA.hostOrg} (${THESIS_METADATA.contactInfo})\n\n`;

      if (activeTab === 'all' || activeTab === 'prelim') {
        fullText += `====================================================\nDECLARATION\n====================================================\n${PRELIMINARY_PAGES.declaration.text}\n\n`;
        fullText += `====================================================\nCERTIFICATION\n====================================================\n${PRELIMINARY_PAGES.certification.text}\n\n`;
        fullText += `====================================================\nABSTRACT\n====================================================\n${PRELIMINARY_PAGES.abstract.paragraphs.join('\n\n')}\n\nKeywords: ${PRELIMINARY_PAGES.abstract.keywords}\n\n`;
      }

      const chaptersToCopy =
        activeTab === 'all'
          ? THESIS_CHAPTERS
          : activeTab === 'ch1'
          ? [THESIS_CHAPTERS[0]]
          : activeTab === 'ch2'
          ? [THESIS_CHAPTERS[1]]
          : activeTab === 'ch3'
          ? [THESIS_CHAPTERS[2]]
          : activeTab === 'ch4'
          ? [THESIS_CHAPTERS[3]]
          : activeTab === 'ch5'
          ? [THESIS_CHAPTERS[4]]
          : [];

      for (const ch of chaptersToCopy) {
        fullText += `====================================================\n${ch.chapterTitle}\n${ch.subtitle}\n====================================================\n\n`;
        for (const sec of ch.sections) {
          fullText += `${sec.number} ${sec.title}\n`;
          for (const p of sec.paragraphs) {
            fullText += `${p}\n\n`;
          }
          if (sec.bullets) {
            for (const b of sec.bullets) {
              fullText += `• ${b.label ? `${b.label} ` : ''}${b.text}\n`;
            }
            fullText += '\n';
          }
          if (sec.table) {
            fullText += `[Table: ${sec.table.headers.join(' | ')}]\n`;
            for (const r of sec.table.rows) {
              fullText += `  ${r.join(' | ')}\n`;
            }
            fullText += '\n';
          }
          if (sec.diagram) {
            fullText += `[Diagram: ${sec.diagram.figureNumber} - ${sec.diagram.title}]\n${sec.diagram.content}\n${sec.diagram.caption}\n\n`;
          }
          if (sec.note) {
            fullText += `[${sec.note}]\n\n`;
          }
        }
      }

      if (activeTab === 'all' || activeTab === 'refs') {
        fullText += `====================================================\nREFERENCES (APA 7th Edition)\n====================================================\n`;
        for (const ref of THESIS_REFERENCES) {
          fullText += `${ref}\n\n`;
        }
      }

      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0047AB] to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-950 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[#FFC72C] text-slate-950">
              {THESIS_METADATA.university}
            </span>
            <span className="text-xs text-blue-200">
              MIT 800 · {THESIS_METADATA.group} · {THESIS_METADATA.session}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            AL-EMAN CLINIC & MATERNITY HOME EMR & CLINIC MANAGEMENT SYSTEM
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-sans">
            {THESIS_METADATA.projectTitle}. {THESIS_METADATA.awardText}.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-amber-300 font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Host Org: {THESIS_METADATA.hostOrg} ({THESIS_METADATA.contactInfo})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Specialization: {THESIS_METADATA.specialization}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Supervisor: {THESIS_METADATA.supervisor}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
          <button
            onClick={() => handleDownloadWord(getActiveChapterNum())}
            disabled={downloading}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FFC72C] hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Download formatted Microsoft Word (.docx) document"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>
              {downloading
                ? 'Compiling Document...'
                : activeTab === 'all'
                ? 'Download Full Thesis (.docx)'
                : activeTab.startsWith('ch')
                ? `Download Ch. ${activeTab.replace('ch', '')} (.docx)`
                : 'Download Thesis (.docx)'}
            </span>
          </button>

          {activeTab !== 'all' && (
            <button
              onClick={() => handleDownloadWord(undefined)}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold border border-blue-500 shadow-sm transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>Download Full 5-Chapter Thesis</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-200" />}
              <span>{copied ? 'Copied Full Text!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-200" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <BookOpen className="w-4 h-4 text-[#0047AB]" />
          <span className="font-bold text-slate-800 mr-1 uppercase tracking-wider text-[11px]">Chapter:</span>
          
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Full Dissertation (Ch. 1–5)
          </button>

          <button
            onClick={() => setActiveTab('prelim')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'prelim'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Preliminaries & Abstract
          </button>

          <button
            onClick={() => setActiveTab('ch1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch1'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 1 — Introduction
          </button>

          <button
            onClick={() => setActiveTab('ch2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch2'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 2 — Literature Review
          </button>

          <button
            onClick={() => setActiveTab('ch3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch3'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 3 — Methodology (Diagrams)
          </button>

          <button
            onClick={() => setActiveTab('ch4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch4'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 4 — System Design (Diagrams & Tests)
          </button>

          <button
            onClick={() => setActiveTab('ch5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch5'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 5 — Conclusion & Roadmap
          </button>

          <button
            onClick={() => setActiveTab('refs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'refs'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            References (APA 7th)
          </button>

          <button
            onClick={() => setActiveTab('appendices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'appendices'
                ? 'bg-[#0047AB] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Appendices A–E
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px] whitespace-nowrap">
          <span>Microsoft Word (.docx) Export Ready</span>
        </div>
      </div>

      {/* Main Document Reading Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm max-w-5xl mx-auto space-y-10 text-slate-800 leading-relaxed font-sans">
        
        {/* Preliminary Pages Section */}
        {(activeTab === 'all' || activeTab === 'prelim') && (
          <section className="space-y-8 pb-10 border-b border-slate-200">
            {/* Title Block Header */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-100">
              <div className="text-xs font-bold tracking-widest text-[#0047AB] uppercase">
                {THESIS_METADATA.university}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase">
                {THESIS_METADATA.universitySub}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 max-w-3xl mx-auto leading-tight">
                {THESIS_METADATA.projectTitle}
              </h2>
              <div className="text-xs text-slate-600 font-medium">
                BY GROUP 5: {THESIS_METADATA.specialization}
              </div>
            </div>

            {/* Authors Table */}
            <div className="overflow-x-auto max-w-2xl mx-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-[#0047AB] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-2 font-bold">Student Researcher Name</th>
                    <th className="px-4 py-2 font-bold">Matric / Registration No.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-slate-50/50">
                  {THESIS_METADATA.authors.map((a, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/60 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{a.name}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-700">{a.regNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Declaration Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-[#0047AB] uppercase tracking-wider">
                {PRELIMINARY_PAGES.declaration.title}
              </h3>
              <p className="text-xs text-slate-700 text-justify leading-relaxed">
                {PRELIMINARY_PAGES.declaration.text}
              </p>
            </div>

            {/* Certification Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-[#0047AB] uppercase tracking-wider">
                {PRELIMINARY_PAGES.certification.title}
              </h3>
              <p className="text-xs text-slate-700 text-justify leading-relaxed">
                {PRELIMINARY_PAGES.certification.text}
              </p>
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 font-medium">
                {PRELIMINARY_PAGES.certification.signatories.map((s, idx) => (
                  <div key={idx} className="p-2 rounded bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400">{s.role}</div>
                    <div className="font-semibold text-slate-800">{s.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-[#0047AB] text-center uppercase tracking-wide">
                {PRELIMINARY_PAGES.abstract.title}
              </h3>
              {PRELIMINARY_PAGES.abstract.paragraphs.map((p, idx) => (
                <p key={idx} className="text-xs sm:text-sm text-slate-700 text-justify leading-relaxed">
                  {p}
                </p>
              ))}
              <div className="text-xs pt-1">
                <span className="font-bold text-[#0047AB]">Keywords: </span>
                <span className="text-slate-600 italic">{PRELIMINARY_PAGES.abstract.keywords}</span>
              </div>
            </div>

            {/* Abbreviations */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                List of Abbreviations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-[#0047AB] text-white text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2 w-28">Abbreviation</th>
                      <th className="px-3 py-2">Meaning / Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {PRELIMINARY_PAGES.abbreviations.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-bold text-[#0047AB]">{item.abbr}</td>
                        <td className="px-3 py-1.5 text-slate-700">{item.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Chapters Section */}
        {THESIS_CHAPTERS.map((ch) => {
          const isVisible =
            activeTab === 'all' ||
            (activeTab === 'ch1' && ch.chapterNumber === 1) ||
            (activeTab === 'ch2' && ch.chapterNumber === 2) ||
            (activeTab === 'ch3' && ch.chapterNumber === 3) ||
            (activeTab === 'ch4' && ch.chapterNumber === 4) ||
            (activeTab === 'ch5' && ch.chapterNumber === 5);

          if (!isVisible) return null;

          return (
            <section key={ch.chapterNumber} className="space-y-8 pb-10 border-b border-slate-200 last:border-b-0">
              
              {/* Chapter Header */}
              <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
                <h2 className="text-lg sm:text-2xl font-black text-[#0047AB] tracking-tight">
                  {ch.chapterTitle}
                </h2>
                <div className="text-xs sm:text-sm text-slate-500 italic max-w-2xl mx-auto">
                  {ch.subtitle}
                </div>
              </div>

              {/* Chapter Sections */}
              <div className="space-y-6">
                {ch.sections.map((sec) => (
                  <article key={sec.id} className="space-y-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-[#0047AB]">{sec.number}</span>
                      <span>{sec.title}</span>
                    </h3>

                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-slate-700 text-justify leading-relaxed">
                        {p}
                      </p>
                    ))}

                    {/* Bullets */}
                    {sec.bullets && sec.bullets.length > 0 && (
                      <ul className="space-y-2 pl-4 text-xs sm:text-sm text-slate-700">
                        {sec.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="list-disc pl-1 text-justify">
                            {b.label && <strong className="text-slate-900 font-semibold">{b.label} </strong>}
                            <span>{b.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Table if present */}
                    {sec.table && sec.table.rows && sec.table.rows.length > 0 && (
                      <div className="my-4 overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0047AB] text-white text-[11px] uppercase tracking-wider">
                            <tr>
                              {sec.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-2.5 font-bold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-2 text-slate-700">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Diagram(s) if present */}
                    {sec.diagram && (
                      <div className="my-5 bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                          <ImageIcon className="w-4 h-4 text-amber-300" />
                          <span>{sec.diagram.figureNumber} — {sec.diagram.title}</span>
                        </div>
                        <div className="overflow-x-auto py-2">
                          <pre className="font-mono text-[11px] sm:text-xs text-blue-200 leading-tight select-all">
                            {sec.diagram.content.trim()}
                          </pre>
                        </div>
                        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800 text-center">
                          {sec.diagram.caption}
                        </div>
                      </div>
                    )}

                    {sec.diagrams && sec.diagrams.map((d, dIdx) => (
                      <div key={dIdx} className="my-5 bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider pb-2 border-b border-slate-800">
                          <ImageIcon className="w-4 h-4 text-amber-300" />
                          <span>{d.figureNumber} — {d.title}</span>
                        </div>
                        <div className="overflow-x-auto py-2">
                          <pre className="font-mono text-[11px] sm:text-xs text-blue-200 leading-tight select-all">
                            {d.content.trim()}
                          </pre>
                        </div>
                        <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800 text-center">
                          {d.caption}
                        </div>
                      </div>
                    ))}

                    {/* Note if present */}
                    {sec.note && (
                      <div className="p-3.5 rounded-lg bg-blue-50 border-l-4 border-[#0047AB] text-xs text-slate-700 italic">
                        {sec.note}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* References Tab */}
        {(activeTab === 'all' || activeTab === 'refs') && (
          <section className="space-y-6 pb-10 border-b border-slate-200">
            <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
              <h2 className="text-lg sm:text-2xl font-black text-[#0047AB] tracking-tight">
                REFERENCES
              </h2>
              <div className="text-xs text-slate-500 italic">
                American Psychological Association (APA), 7th Edition
              </div>
            </div>

            <div className="space-y-3 pl-4">
              {THESIS_REFERENCES.map((ref, idx) => (
                <p key={idx} className="text-xs sm:text-sm text-slate-700 text-justify leading-relaxed indent-[-1.5rem] pl-6">
                  {ref}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Appendices Tab */}
        {(activeTab === 'all' || activeTab === 'appendices') && (
          <section className="space-y-8 pb-10">
            <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
              <h2 className="text-lg sm:text-2xl font-black text-[#0047AB] tracking-tight">
                APPENDICES
              </h2>
              <div className="text-xs text-slate-500 italic">
                Supplementary Clinical Formulary, Operator Credentials, Code Listings, and Project Management
              </div>
            </div>

            {/* Appendix A */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {THESIS_APPENDICES.appendixA.title}
              </h3>
              <p className="text-xs text-slate-600 italic">
                {THESIS_APPENDICES.appendixA.subtitle}
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0047AB] text-white text-[10px] uppercase">
                    <tr>
                      {THESIS_APPENDICES.appendixA.table.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {THESIS_APPENDICES.appendixA.table.rows.map((row, rI) => (
                      <tr key={rI} className="hover:bg-slate-50">
                        {row.map((cell, cI) => (
                          <td key={cI} className="px-3 py-2 text-slate-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Appendix B */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {THESIS_APPENDICES.appendixB.title}
              </h3>
              <p className="text-xs text-slate-600 italic">
                {THESIS_APPENDICES.appendixB.subtitle}
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0047AB] text-white text-[10px] uppercase">
                    <tr>
                      {THESIS_APPENDICES.appendixB.table.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {THESIS_APPENDICES.appendixB.table.rows.map((row, rI) => (
                      <tr key={rI} className="hover:bg-slate-50">
                        {row.map((cell, cI) => (
                          <td key={cI} className="px-3 py-2 text-slate-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Appendix C */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {THESIS_APPENDICES.appendixC.title}
              </h3>
              <p className="text-xs text-slate-600 italic">
                {THESIS_APPENDICES.appendixC.subtitle}
              </p>
              {THESIS_APPENDICES.appendixC.listings.map((l, i) => (
                <div key={i} className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-300 font-mono">{l.title}</div>
                  <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto select-all leading-tight">
                    {l.code}
                  </pre>
                </div>
              ))}
            </div>

            {/* Appendix D */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {THESIS_APPENDICES.appendixD.title}
              </h3>
              <div className="space-y-2">
                {THESIS_APPENDICES.appendixD.links.map((link, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="font-bold text-[#0047AB]">{link.label}</span>
                    <span className="font-mono text-slate-700">{link.url}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Appendix E */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {THESIS_APPENDICES.appendixE.title}
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0047AB] text-white text-[10px] uppercase">
                    <tr>
                      {THESIS_APPENDICES.appendixE.table.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {THESIS_APPENDICES.appendixE.table.rows.map((row, rI) => (
                      <tr key={rI} className="hover:bg-slate-50">
                        {row.map((cell, cI) => (
                          <td key={cI} className="px-3 py-2 text-slate-700">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>

    </div>
  );
};
