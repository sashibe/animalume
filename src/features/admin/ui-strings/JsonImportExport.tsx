import { useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { splitByLocale, mergeFromLocale } from './string-helpers';
import type { UiStrings } from '../shared/types';

type Props = {
  strings: UiStrings;
  onImport: (next: UiStrings) => void;
};

export function JsonImportExport({ strings, onImport }: Props) {
  const [mode, setMode] = useState<'closed' | 'export' | 'import'>('closed');
  const [importJa, setImportJa] = useState('');
  const [importKo, setImportKo] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const exported = splitByLocale(strings);

  const handleImport = () => {
    try {
      const ja = importJa.trim() ? JSON.parse(importJa) : {};
      const ko = importKo.trim() ? JSON.parse(importKo) : {};
      onImport(mergeFromLocale(ja, ko));
      setMode('closed');
      setImportJa('');
      setImportKo('');
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'JSON解析エラー');
    }
  };

  if (mode === 'closed') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setMode('export')}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> エクスポート
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMode('import')}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> インポート
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
          <h2 className="font-medium text-stone-800">
            {mode === 'export' ? 'JSON エクスポート' : 'JSON インポート'}
          </h2>
          <button
            type="button"
            onClick={() => setMode('closed')}
            className="p-1 text-stone-400 hover:text-stone-700 rounded"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mode === 'export' && (
            <>
              <p className="text-xs text-stone-500">
                以下を <code>i18n/ja.json</code> / <code>i18n/ko.json</code> に貼り付けてコミットしてください。
              </p>
              <ExportBlock label="ja.json" json={exported.ja} />
              <ExportBlock label="ko.json" json={exported.ko} />
            </>
          )}

          {mode === 'import' && (
            <>
              <p className="text-xs text-stone-500">
                既存の <code>ja.json</code> / <code>ko.json</code> を貼り付けてください。空欄でも可。
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">ja.json</label>
                <Textarea
                  value={importJa}
                  onChange={(e) => setImportJa(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="{...}"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">ko.json</label>
                <Textarea
                  value={importKo}
                  onChange={(e) => setImportKo(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="{...}"
                />
              </div>
              {importError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {importError}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="flex justify-end gap-2 px-5 py-3 border-t border-stone-200">
          <Button variant="ghost" onClick={() => setMode('closed')}>キャンセル</Button>
          {mode === 'import' && (
            <Button onClick={handleImport}>インポート実行</Button>
          )}
        </footer>
      </div>
    </div>
  );
}

function ExportBlock({ label, json }: { label: string; json: object }) {
  const text = JSON.stringify(json, null, 2);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-stone-700">{label}</label>
        <Button variant="ghost" size="sm" onClick={copy} className="h-7 text-xs">
          {copied ? 'コピーしました' : 'コピー'}
        </Button>
      </div>
      <pre className="bg-stone-50 border border-stone-200 rounded p-3 text-xs font-mono overflow-auto max-h-48">
        {text}
      </pre>
    </div>
  );
}
