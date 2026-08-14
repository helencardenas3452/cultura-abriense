import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  FileText, 
  FileCode, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Droplets,
  BookOpen,
  Share2
} from 'lucide-react';
import { EmotionalFlaskEntry, PresenceEcho } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  flasks: EmotionalFlaskEntry[];
  echos: PresenceEcho[];
}

export default function ExportModal({ isOpen, onClose, flasks, echos }: ExportModalProps) {
  const [activeFormat, setActiveFormat] = useState<'text' | 'markdown' | 'json'>('text');
  const [copied, setCopied] = useState(false);

  // Generate structured plain text export
  const formattedText = useMemo(() => {
    const dateStr = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let content = `====================================================\n`;
    content += `PURO — REFUGIO EMOCIONAL | BITÁCORA DE INTROSPECCIÓN\n`;
    content += `Fecha de exportación: ${dateStr}\n`;
    content += `====================================================\n\n`;

    content += `--- RESUMEN DEL SER ---\n`;
    content += `• Total de frascos emocionales sellados: ${flasks.length}\n`;
    content += `• Total de ecos de presencia registrados: ${echos.length}\n\n`;

    content += `====================================================\n`;
    content += `I. FRASCOS EMOCIONALES & ESPEJO SOCRÁTICO\n`;
    content += `====================================================\n\n`;

    if (flasks.length === 0) {
      content += `(Aún no hay frascos sellados en la bóveda)\n\n`;
    } else {
      flasks.forEach((flask, index) => {
        content += `[FRASCO #${flasks.length - index}] - ${flask.timestamp || flask.date}\n`;
        if (flask.tags && flask.tags.length > 0) {
          content += `Etiquetas / Contexto: ${flask.tags.map(t => '#' + t).join(' ')}\n`;
        }
        content += `Emociones vertidas:\n`;
        flask.emotions.forEach(e => {
          const stars = '★'.repeat(e.intensity) + '☆'.repeat(5 - e.intensity);
          content += `  • ${e.name.toUpperCase()}: ${stars} (Nivel ${e.intensity}/5)\n`;
        });
        content += `\nPregunta del Espejo Socrático:\n`;
        content += `  "${flask.socraticQuestion}"\n\n`;
        content += `Reflexión personal:\n`;
        content += `  ${flask.socraticReflection.replace(/\n/g, '\n  ')}\n`;
        content += `----------------------------------------------------\n\n`;
      });
    }

    content += `====================================================\n`;
    content += `II. ECOS DE PRESENCIA & RITUALES VIVIDOS\n`;
    content += `====================================================\n\n`;

    if (echos.length === 0) {
      content += `(Aún no hay ecos de presencia registrados)\n\n`;
    } else {
      echos.forEach((echo) => {
        content += `• [${echo.date}] ${echo.title}`;
        if (echo.tags && echo.tags.length > 0) {
          content += ` [${echo.tags.map(t => '#' + t).join(' ')}]`;
        }
        content += `\n  Detalle: ${echo.detail}\n\n`;
      });
    }

    content += `====================================================\n`;
    content += `“La calma es el suelo donde florece el alma.”\n`;
    content += `PURO — Tecnología Serena para el Autocuidado\n`;
    content += `====================================================\n`;

    return content;
  }, [flasks, echos]);

  // Generate Markdown export
  const formattedMarkdown = useMemo(() => {
    const dateStr = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let md = `# 🌿 PURO — Refugio Emocional\n\n`;
    md += `*Bitácora de introspección exportada el ${dateStr}*\n\n`;
    md += `> "La calma es el suelo donde florece el alma."\n\n`;
    md += `## 📊 Resumen del Tapiz Histórico\n\n`;
    md += `- **Frascos emocionales sellados:** ${flasks.length}\n`;
    md += `- **Ecos de presencia:** ${echos.length}\n\n`;

    md += `## ☁️ Frascos Emocionales & Espejo Socrático\n\n`;
    if (flasks.length === 0) {
      md += `*No se han registrado frascos en la bóveda.*\n\n`;
    } else {
      flasks.forEach((flask, index) => {
        md += `### 🏺 Frasco #${flasks.length - index} — ${flask.timestamp || flask.date}\n\n`;
        if (flask.tags && flask.tags.length > 0) {
          md += `*Etiquetas:* ${flask.tags.map(t => `\`#${t}\``).join(' ')}\n\n`;
        }
        md += `**Emociones reconocidas:**\n`;
        flask.emotions.forEach(e => {
          md += `- **${e.name}**: ${'●'.repeat(e.intensity)}${'○'.repeat(5 - e.intensity)} *(Nivel ${e.intensity}/5)*\n`;
        });
        md += `\n**Pregunta Socrática:**\n`;
        md += `> *${flask.socraticQuestion}*\n\n`;
        md += `**Reflexión:**\n`;
        md += `${flask.socraticReflection}\n\n`;
        md += `---\n\n`;
      });
    }

    md += `## 🌬️ Ecos de Presencia\n\n`;
    if (echos.length === 0) {
      md += `*No hay ecos registrados aún.*\n\n`;
    } else {
      echos.forEach(echo => {
        const tagString = echo.tags && echo.tags.length > 0 ? ` [${echo.tags.map(t => `#${t}`).join(', ')}]` : '';
        md += `- **${echo.date}** | **${echo.title}**${tagString}: ${echo.detail}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
    md += `*Generado localmente por PURO — Refugio Emocional.*\n`;
    return md;
  }, [flasks, echos]);

  // Generate structured JSON
  const formattedJSON = useMemo(() => {
    const exportObject = {
      app: "PURO - Refugio Emocional",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      summary: {
        totalFlasks: flasks.length,
        totalEchos: echos.length,
      },
      flasks,
      echos
    };
    return JSON.stringify(exportObject, null, 2);
  }, [flasks, echos]);

  const currentPreviewContent = useMemo(() => {
    if (activeFormat === 'text') return formattedText;
    if (activeFormat === 'markdown') return formattedMarkdown;
    return formattedJSON;
  }, [activeFormat, formattedText, formattedMarkdown, formattedJSON]);

  const handleDownload = (formatToDownload?: 'text' | 'markdown' | 'json') => {
    const targetFormat = formatToDownload || activeFormat;
    let mimeType = 'text/plain;charset=utf-8';
    let fileExtension = 'txt';
    let contentToSave = formattedText;

    if (targetFormat === 'markdown') {
      mimeType = 'text/markdown;charset=utf-8';
      fileExtension = 'md';
      contentToSave = formattedMarkdown;
    } else if (targetFormat === 'json') {
      mimeType = 'application/json;charset=utf-8';
      fileExtension = 'json';
      contentToSave = formattedJSON;
    }

    const blob = new Blob([contentToSave], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `puro_historial_emocional_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPreviewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-[#faf7f2] dark:bg-[#202522] rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200/80 dark:border-neutral-700/60 z-10 flex flex-col max-h-[90vh] space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200/70 dark:border-neutral-700/60">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-puro)]/15 text-[10px] font-mono uppercase tracking-wider text-[var(--primary-puro)] font-semibold">
                <Download className="w-3 h-3" />
                <span>Respaldo & Soberanía de Datos</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[var(--text-puro)]">
                Exportar Historial de Sempiterno
              </h3>
              <p className="text-xs text-[var(--text-puro-muted)] font-light leading-relaxed">
                Descarga tus reflexiones y frascos en un formato legible para conservarlos fuera de la aplicación.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/80">
              <button
                onClick={() => setActiveFormat('text')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  activeFormat === 'text'
                    ? 'bg-white dark:bg-neutral-700 text-[var(--text-puro)] shadow-2xs font-medium'
                    : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Diario Texto (.txt)</span>
              </button>

              <button
                onClick={() => setActiveFormat('markdown')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  activeFormat === 'markdown'
                    ? 'bg-white dark:bg-neutral-700 text-[var(--text-puro)] shadow-2xs font-medium'
                    : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Markdown (.md)</span>
              </button>

              <button
                onClick={() => setActiveFormat('json')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  activeFormat === 'json'
                    ? 'bg-white dark:bg-neutral-700 text-[var(--text-puro)] shadow-2xs font-medium'
                    : 'text-[var(--text-puro-muted)] hover:text-[var(--text-puro)]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>JSON Estructurado (.json)</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 text-xs font-mono text-[var(--text-puro-muted)] border border-neutral-200 dark:border-neutral-700 shadow-2xs transition-all cursor-pointer"
              title="Copiar texto al portapapeles"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Live Preview Box */}
          <div className="flex-1 min-h-[220px] max-h-[300px] rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[var(--text-puro)] selection:bg-[var(--primary-puro)]/20 whitespace-pre-wrap shadow-inner">
            {currentPreviewContent}
          </div>

          {/* Footer Actions & Privacy Notice */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-puro-muted)] font-light">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--primary-puro)]" />
                <span>Tus datos se procesan 100% de forma local en tu navegador.</span>
              </div>
              <span className="font-mono text-[10px]">
                {flasks.length} frascos • {echos.length} ecos
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium text-[var(--text-puro-muted)] hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Cerrar
              </button>

              <button
                onClick={() => handleDownload()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--primary-puro)] hover:opacity-90 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  Descargar como {activeFormat === 'text' ? 'Diario (.txt)' : activeFormat === 'markdown' ? 'Markdown (.md)' : 'JSON (.json)'}
                </span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
