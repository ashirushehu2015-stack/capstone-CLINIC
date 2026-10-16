import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  X,
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

interface ChapterOneModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const ChapterOneModal: React.FC<ChapterOneModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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
      console.error('Failed to download Word doc:', err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0047AB] to-blue-900 text-white px-5 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-950 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-[#FFC72C]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {THESIS_METADATA.university}
                </span>
                <span className="text-[10px] text-blue-200">
                  MIT 800 · {THESIS_METADATA.group} · Supervisor: {THESIS_METADATA.supervisor}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-0.5">
                AL-EMAN CLINIC & MATERNITY HOME: CAPSTONE PROJECT DISSERTATION (CHAPTERS 1–5)
              </h2>
            </div>
          </div>

          {/* Action Buttons: Word Download & Copy */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            <button
              onClick={() => handleDownloadWord(getActiveChapterNum())}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC72C] hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download formatted Microsoft Word document (.docx)"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>
                {downloading
                  ? 'Compiling...'
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
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold border border-blue-500 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                <span>Full Thesis (.docx)</span>
              </button>
            )}

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-200" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-200" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Tabs Sub-Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs flex-shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-[#0047AB] shrink-0" />
          <span className="font-bold text-slate-700 mr-1 uppercase text-[10px]">Jump to:</span>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Complete Dissertation (Ch. 1–5)
          </button>

          <button
            onClick={() => setActiveTab('prelim')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'prelim'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Preliminaries
          </button>

          <button
            onClick={() => setActiveTab('ch1')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch1'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 1 Introduction
          </button>

          <button
            onClick={() => setActiveTab('ch2')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch2'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 2 Literature Review
          </button>

          <button
            onClick={() => setActiveTab('ch3')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch3'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 3 Methodology (Diagrams)
          </button>

          <button
            onClick={() => setActiveTab('ch4')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch4'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 4 System Design & Tests
          </button>

          <button
            onClick={() => setActiveTab('ch5')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ch5'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ch. 5 Conclusion
          </button>

          <button
            onClick={() => setActiveTab('refs')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'refs'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            References
          </button>

          <button
            onClick={() => setActiveTab('appendices')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'appendices'
                ? 'bg-[#0047AB] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Appendices
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 text-slate-800 leading-relaxed font-sans">
          
          {/* Preliminary Pages */}
          {(activeTab === 'all' || activeTab === 'prelim') && (
            <div className="space-y-6 pb-8 border-b border-slate-200">
              <div className="text-center space-y-2">
                <div className="text-xs font-bold text-[#0047AB] uppercase">
                  {THESIS_METADATA.university}
                </div>
                <h3 className="text-lg font-black text-slate-900 max-w-2xl mx-auto">
                  {THESIS_METADATA.projectTitle}
                </h3>
                <div className="text-xs text-slate-600">
                  BY GROUP 5: {THESIS_METADATA.specialization}
                </div>
              </div>

              {/* Authors Table */}
              <div className="overflow-x-auto max-w-xl mx-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-[#0047AB] text-white text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-1.5">Student Researcher</th>
                      <th className="px-3 py-1.5">Matric No.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-slate-50">
                    {THESIS_METADATA.authors.map((a, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 font-semibold text-slate-800">{a.name}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{a.regNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Abstract */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-[#0047AB] uppercase tracking-wide">
                  {PRELIMINARY_PAGES.abstract.title}
                </h4>
                {PRELIMINARY_PAGES.abstract.paragraphs.map((p, i) => (
                  <p key={i} className="text-xs text-slate-700 text-justify leading-relaxed">
                    {p}
                  </p>
                ))}
                <div className="text-[11px] pt-1">
                  <span className="font-bold text-[#0047AB]">Keywords: </span>
                  <span className="text-slate-600 italic">{PRELIMINARY_PAGES.abstract.keywords}</span>
                </div>
              </div>
            </div>
          )}

          {/* Chapters */}
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
              <div key={ch.chapterNumber} className="space-y-6 pb-8 border-b border-slate-200 last:border-b-0">
                <div className="text-center space-y-1 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-xl font-black text-[#0047AB]">
                    {ch.chapterTitle}
                  </h3>
                  <p className="text-xs text-slate-500 italic max-w-xl mx-auto">
                    {ch.subtitle}
                  </p>
                </div>

                <div className="space-y-5">
                  {ch.sections.map((sec) => (
                    <div key={sec.id} className="space-y-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-[#0047AB]">{sec.number}</span>
                        <span>{sec.title}</span>
                      </h4>

                      {sec.paragraphs.map((p, pI) => (
                        <p key={pI} className="text-xs text-slate-700 text-justify leading-relaxed">
                          {p}
                        </p>
                      ))}

                      {sec.bullets && (
                        <ul className="space-y-1.5 pl-4 text-xs text-slate-700">
                          {sec.bullets.map((b, bI) => (
                            <li key={bI} className="list-disc pl-1 text-justify">
                              {b.label && <strong className="text-slate-900 font-semibold">{b.label} </strong>}
                              <span>{b.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {sec.table && (
                        <div className="my-3 overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-[#0047AB] text-white uppercase text-[10px]">
                              <tr>
                                {sec.table.headers.map((h, hI) => (
                                  <th key={hI} className="px-3 py-2 font-bold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {sec.table.rows.map((row, rI) => (
                                <tr key={rI} className="hover:bg-slate-50">
                                  {row.map((cell, cI) => (
                                    <td key={cI} className="px-3 py-1.5 text-slate-700">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Diagram(s) */}
                      {sec.diagram && (
                        <div className="my-4 bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold uppercase pb-1 border-b border-slate-800">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{sec.diagram.figureNumber} — {sec.diagram.title}</span>
                          </div>
                          <div className="overflow-x-auto py-1">
                            <pre className="font-mono text-[10px] text-blue-200 leading-tight">
                              {sec.diagram.content.trim()}
                            </pre>
                          </div>
                          <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-slate-800">
                            {sec.diagram.caption}
                          </div>
                        </div>
                      )}

                      {sec.diagrams && sec.diagrams.map((d, dIdx) => (
                        <div key={dIdx} className="my-4 bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold uppercase pb-1 border-b border-slate-800">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>{d.figureNumber} — {d.title}</span>
                          </div>
                          <div className="overflow-x-auto py-1">
                            <pre className="font-mono text-[10px] text-blue-200 leading-tight">
                              {d.content.trim()}
                            </pre>
                          </div>
                          <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-slate-800">
                            {d.caption}
                          </div>
                        </div>
                      ))}

                      {sec.note && (
                        <div className="p-2.5 rounded bg-blue-50 border-l-4 border-[#0047AB] text-[11px] text-slate-700 italic">
                          {sec.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* References Tab */}
          {(activeTab === 'all' || activeTab === 'refs') && (
            <div className="space-y-4 pb-8 border-b border-slate-200">
              <h3 className="text-base font-bold text-[#0047AB] text-center uppercase tracking-wide">
                REFERENCES (APA 7th Edition)
              </h3>
              <div className="space-y-2 pl-4">
                {THESIS_REFERENCES.map((ref, i) => (
                  <p key={i} className="text-xs text-slate-700 text-justify indent-[-1.5rem] pl-6 leading-relaxed">
                    {ref}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Appendices Tab */}
          {(activeTab === 'all' || activeTab === 'appendices') && (
            <div className="space-y-6 pb-8">
              <h3 className="text-base font-bold text-[#0047AB] text-center uppercase tracking-wide">
                APPENDICES
              </h3>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {THESIS_APPENDICES.appendixA.title}
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#0047AB] text-white uppercase text-[10px]">
                      <tr>
                        {THESIS_APPENDICES.appendixA.table.headers.map((h, i) => (
                          <th key={i} className="px-3 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {THESIS_APPENDICES.appendixA.table.rows.map((row, rI) => (
                        <tr key={rI} className="hover:bg-slate-50">
                          {row.map((c, cI) => (
                            <td key={cI} className="px-3 py-1.5 text-slate-700">{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {THESIS_APPENDICES.appendixB.title}
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#0047AB] text-white uppercase text-[10px]">
                      <tr>
                        {THESIS_APPENDICES.appendixB.table.headers.map((h, i) => (
                          <th key={i} className="px-3 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {THESIS_APPENDICES.appendixB.table.rows.map((row, rI) => (
                        <tr key={rI} className="hover:bg-slate-50">
                          {row.map((c, cI) => (
                            <td key={cI} className="px-3 py-1.5 text-slate-700">{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {THESIS_APPENDICES.appendixE.title}
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#0047AB] text-white uppercase text-[10px]">
                      <tr>
                        {THESIS_APPENDICES.appendixE.table.headers.map((h, i) => (
                          <th key={i} className="px-3 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {THESIS_APPENDICES.appendixE.table.rows.map((row, rI) => (
                        <tr key={rI} className="hover:bg-slate-50">
                          {row.map((c, cI) => (
                            <td key={cI} className="px-3 py-1.5 text-slate-700">{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
