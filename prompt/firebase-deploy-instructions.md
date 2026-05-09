# Animalume - Firebase Hosting デプロイ作業

スマホで動作確認するため、Animalume を Firebase Hosting にデプロイしてください。

---

## 前提

- Firebase プロジェクト `animalume` は既に作成済み
- ローカル環境で `pnpm dev` は正常動作している
- Firebase CLI のログイン状態は不明（必要なら確認）

---

## 作業手順

### Step 1: 環境確認

```powershell
firebase --version
```

Firebase CLI がインストールされているか確認。
未インストールなら `npm install -g firebase-tools` でインストール。

```powershell
firebase login:list
```

ログイン状態を確認。未ログインなら `firebase login` を促す。
（ブラウザが開くので、ユーザーの操作が必要）

### Step 2: Firebase Hosting 設定

`firebase.json` がプロジェクトルートに既に存在するか確認。

```powershell
cat firebase.json
```

存在しないか、Hosting設定が含まれていない場合は、以下の内容で作成：

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

**ポイント**：
- `public: "dist"` → Vite のビルド成果物ディレクトリ
- `rewrites` の SPA 設定 → React Router で動作させるため
- `headers` で画像と JS/CSS をキャッシュ（高速化）
- 既存の Firestore 設定があれば残す

`.firebaserc` も確認・作成：

```json
{
  "projects": {
    "default": "animalume"
  }
}
```

### Step 3: ビルド前の最終チェック

```powershell
pnpm typecheck
pnpm lint
```

エラーが出たら修正してから次へ。

### Step 4: プロダクションビルド

```powershell
pnpm build
```

`dist/` ディレクトリにビルド成果物が出力される。
ビルドエラーが出たら、修正して再実行。

ビルド完了後、`dist/` の中身を確認：

```powershell
ls dist
```

`index.html` と `assets/` フォルダがあればOK。
`dist/characters/` に16タイプ × 3バージョンの画像が含まれているか確認：

```powershell
ls dist/characters
```

16フォルダ（01intj 〜 16esfp）あればOK。

### Step 5: Firebase Hosting にデプロイ

```powershell
firebase deploy --only hosting
```

完了すると以下のような出力：

```
✔ Deploy complete!

Hosting URL: https://animalume.web.app
```

このURLをユーザーに報告してください。

### Step 6: 動作確認の案内

ユーザーに以下を伝える：

1. **デプロイ先URL**: `https://animalume.web.app`
2. **スマホでの確認方法**:
   - スマホのブラウザでこのURLを開く
   - またはPCで開いてQRコード生成、スマホでスキャン
3. **確認すべき項目**:
   - ホーム → 診断 → 結果 の通しフロー
   - スマホでのタップ操作
   - スワイプ操作
   - 画像読み込みの速度
   - 文字の読みやすさ
   - 言語切替
   - レイアウト崩れ（ノッチ・セーフエリア対応）

---

## トラブルシューティング

### `firebase login` でブラウザが開かない場合

```powershell
firebase login --no-localhost
```

URLが表示されるので、別のブラウザで開いてログイン。
認証コードを取得してCLIに貼り付ける。

### `firebase init` がすでに完了している扱いになる場合

`firebase.json` と `.firebaserc` が既に存在する状態。
Step 2 をスキップして、Step 4（ビルド）から進めればOK。

### ビルドサイズが大きい警告

```
Some chunks are larger than 500 kB after minification.
```

これは警告であってエラーじゃない。MVP段階では無視してOK。
将来的に code-splitting で対応。

### キャラクター画像が表示されない（Hosting後）

`public/characters/` の画像が `dist/characters/` にコピーされているか確認。
Vite はデフォルトで `public/` の中身を `dist/` にコピーする。
されていなければ、`vite.config.ts` の `publicDir` 設定を確認。

### Firestore接続エラー

本番環境では Firestore のセキュリティルールがより厳格に適用される。
匿名認証が動作しているか確認。
動作しない場合は、Firebase Console で `Authentication > Sign-in method > Anonymous` が有効か確認。

### カスタムドメイン（animalume.com）に切り替えたい場合

これは今回のスコープ外。デフォルトの `.web.app` ドメインで動作確認後、別途検討。

---

## デプロイ後の確認事項

ユーザーに以下を確認してもらうこと：

- [ ] `https://animalume.web.app` がスマホで開ける
- [ ] ホーム画面が表示される
- [ ] 「診断をはじめる」をタップして診断画面に遷移する
- [ ] 設問が表示される
- [ ] スワイプまたはタップで回答できる
- [ ] 40問完了後、結果画面に遷移する
- [ ] キャラクター画像が表示される
- [ ] アコーディオン（詳しく見る）が開閉する
- [ ] 言語切替（ja/ko）が動作する
- [ ] レイアウトがスマホ画面に最適化されている

問題があれば、その内容を報告してもらってください。

---

## コミット

デプロイ完了後、`firebase.json` `.firebaserc` などの設定ファイルが作成・更新されているはずなので、コミットしてください：

```powershell
git add firebase.json .firebaserc
git commit -m "chore: setup Firebase Hosting deployment"
```

ただし `dist/` フォルダは `.gitignore` で除外されているはずなので確認。
されていなければ追加する：

```
# .gitignore に以下があるか確認
dist/
```

---

## 完了報告

すべて完了したら、以下を報告してください：

1. デプロイURL（例：https://animalume.web.app）
2. ビルドサイズ（合計KB）
3. デプロイにかかった時間
4. 何か警告やエラーが出ていれば、その内容
5. 次のステップ（カスタムドメイン設定など）への注意事項
