# ADR-0010: 単一ドメイン運用の方針

## ステータス
Accepted

## 日付
2026-05-27

## 文脈

Phase 2 で animalume.com への独自ドメイン切り替えを行った際、
www.animalume.com も Firebase Hosting のカスタムドメインとして登録された
が、www → 非www のリダイレクト設定が漏れていた。

結果として:
- animalume.com と www.animalume.com が独立したドメインとして動作
- Firebase Auth の匿名 UID、localStorage、IndexedDB がドメイン別に発行
- 同じ Animalume アプリにも関わらず、ユーザーの履歴・認証セッションが
  ドメインごとに分散する状態が発生

Phase 3.6 の動作確認時に、Sori が www 側で過去診断していたため、
非www ドメインで履歴が見られない事象が発覚。

## 決定

Animalume は animalume.com を唯一の本番ドメインとする。

- www.animalume.com は animalume.com へのリダイレクトドメインとして設定する
- 将来サブドメインを追加する場合（例: m.animalume.com, api.animalume.com）も、
  認証セッション分離による履歴分散が起きないよう、配信ドメインと認証ドメインの
  関係を必ず設計時点で検討する

## 結果

- Firebase Hosting で www.animalume.com をリダイレクトドメインに再設定（2026-05-27）
- DNS 設定は変更なし（CNAME は既に animalume.web.app を指している）
- SSL 証明書は Firebase 側で自動再発行
- 過去に www 側で発生したテスト用匿名 UID の履歴は、技術的に救出不可だが
  本番運用前のため実害なし

## 関連

- Phase 2 のドメイン切り替え作業
- docs/operations/domain-migration-checklist.md
