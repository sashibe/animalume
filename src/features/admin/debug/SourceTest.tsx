import { useEffect, useState } from 'react';
import { loadAllQuestions } from '../sources/question-source';
import { loadAllTypeMetas } from '../sources/type-source';
import type { SourceQuestion, SourceTypeMeta } from '../shared/source-types';

/**
 * Step 2 の読み込み動作確認用デバッグページ。
 * 本番には残さない。Step 3 完了後に削除する。
 */
export function SourceTest() {
  const [questions, setQuestions] = useState<SourceQuestion[] | null>(null);
  const [metas, setMetas] = useState<SourceTypeMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadAllQuestions(), loadAllTypeMetas()])
      .then(([qs, ms]) => {
        setQuestions(qs);
        setMetas(ms);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        console.error('[SourceTest] load failed', e);
      });
  }, []);

  if (error) {
    return (
      <pre style={{ padding: 24, background: '#fee', color: '#900' }}>
        Error: {error}
      </pre>
    );
  }

  if (!questions || !metas) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 12 }}>
      <h1>Source Test</h1>
      <h2>Questions ({questions.length} total)</h2>
      <p>Axes count:
        EI={questions.filter((q) => q.axis === 'EI').length} /
        SN={questions.filter((q) => q.axis === 'SN').length} /
        TF={questions.filter((q) => q.axis === 'TF').length} /
        JP={questions.filter((q) => q.axis === 'JP').length}
      </p>
      <p>First question:</p>
      <pre>{JSON.stringify(questions[0], null, 2)}</pre>

      <h2>Type Metas ({metas.length} total)</h2>
      <p>First meta:</p>
      <pre>{JSON.stringify(metas[0], null, 2)}</pre>
    </div>
  );
}
