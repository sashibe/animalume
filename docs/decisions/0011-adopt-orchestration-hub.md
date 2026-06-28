# 0011. Adopt agent-orchestration-hub

- Status: Accepted（Sori「A で進めて」で承認＝§5-1 / 2026-06-28）
- Date: 2026-06-28

## Context
Animalume は既存 full-stack（React/TS + Firebase）。orchestration-hub を後適用するにあたり、標準スタック（GitHub・Supabase・Vercel・Notion）との差分処理を決める必要があった。

## Decision
1. 体制採用: GitHub（sashibe/animalume）＋Notion 4DB を敷く。profile = full-stack。
2. 基盤読み替え: データ真実層＝Firestore、実行層＝Firebase Hosting。よって Supabase ref=none / Vercel=非該当。
3. dev_context は立てない。main の docs は Project Knowledge で読め、手動受け渡し（ADR-0008）＋単一canonical運用のため非main可視化の便益が薄い。必要時に共有Supabase相乗りで追加可。
4. §3 検証: claude.ai（Web）に Firebase コネクタは繋がらない（公式 Firebase MCP は stdio/ローカル）。Firestore・Auth・Hosting 検証は Code レーン（公式 Firebase プラグイン/firebase CLI）に置き、Web は一次ソース出力を要求して照合する。

## Consequences
- 「薄くても敷く：GitHubリポ＋Notion台帳」原則を満たす。
- Web の独立検証は Code の一次ソース出力＋要所 Chrome（コンソール）で担保。
- 環境は単一（prod=animalume / staging=none, 2026-06-28 Code確認）。

## Alternatives considered
- dev_context B（共有Supabase相乗り）/ C（専用Supabase新設）→ 現状はコスト・配線過剰で却下。
