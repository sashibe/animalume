# Animalume - デバッグ知見集

> このドキュメントは、開発中に遭遇したバグと教訓を記録する。
> 同じ罠を繰り返さないためのプロジェクトメモリ。
> 新機能実装時、Claude Code はこのドキュメントを参照して類似パターンを避けること。

---

## 1. React Hooks の罠

### 1.1 「依存配列に毎レンダリングで新しい参照を持つ値」を入れない

#### 症状

- useEffect が無限ループする
- debounce タイマーが永遠にリセットされる
- 「保存中」が永久に消えない、IndexedDB に保存されない
- React が「Hook 順序エラー」を投げる場合もある

#### 原因パターン A: コールバック関数を依存配列に含める

```tsx
// ❌ 悪い例
function MyComponent() {
  useAutoSave(data, {
    onSaved: () => {           // ← 毎レンダリングで新しい関数
      setStatus('saved');
    },
  });
}

// useAutoSave 側
useEffect(() => {
  // ...
}, [data, onSaved]);  // ← onSaved が毎回変わるので毎回 cleanup → タイマーが永遠にリセット
```

#### 修正パターン A: useRef でコールバックを保持

```tsx
// ✅ 良い例
function useAutoSave(data, options) {
  const onSavedRef = useRef(options.onSaved);

  // 最新コールバックを ref に同期
  useEffect(() => {
    onSavedRef.current = options.onSaved;
  }, [options.onSaved]);

  // メイン処理は onSavedRef.current を参照
  useEffect(() => {
    // ...
    onSavedRef.current?.();
  }, [data]);  // onSaved を依存配列から外す
}
```

#### 原因パターン B: props のデフォルト引数で `{}` や `[]` を使う

```tsx
// ❌ 悪い例
export function MyEditor({ initial = {}, onBack }: Props) {
  //                       ^^^^^^^ 毎レンダリングで新しい {} が作られる

  useEffect(() => {
    setData(initial);
  }, [initial]);  // ← initial が毎回新しい参照 → 毎レンダリング再実行 → 無限ループ
}
```

#### 修正パターン B: モジュールスコープの定数 + 遅延初期化

```tsx
// ✅ 良い例
const EMPTY_INITIAL = {};  // モジュールスコープの不変参照

export function MyEditor({ initial, onBack }: Props) {
  const [data, setData] = useState(() => initial ?? EMPTY_INITIAL);
  //                                ^^^^^ 関数で渡す（マウント時 1 回だけ評価）

  useEffect(() => {
    loadDraft(initial ?? EMPTY_INITIAL).then(setData);
    // 初回マウント時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // 依存配列を空に
}
```

#### 一般化された教訓

**依存配列に入れる値は「参照が安定しているもの」だけ**。以下は要注意：
- props のデフォルト引数 `= {}` `= []` `= () => {}`
- インラインで作るオブジェクト `{ key: value }`
- インラインで作る関数 `() => ...`
- `new SomeClass()` の結果

これらを依存配列に入れる必要があるなら：
- **オブジェクト/配列** → モジュールスコープ定数 or `useMemo`
- **関数** → `useCallback` or `useRef`
- **クラスインスタンス** → `useMemo`

---

### 1.2 Hook は条件分岐の前に呼ぶ（早期 return より前）

#### 症状

```
React has detected a change in the order of Hooks called by ComponentName
Previous render: 13. useEffect / Next render: 13. useRef
```

#### 原因

```tsx
// ❌ 悪い例
function MyComponent() {
  const [data, setData] = useState(initial);

  if (!data) {
    return <Loading />;  // ← 早期 return
  }

  useEffect(() => { /* ... */ });  // ← 条件によって呼ばれない
}
```

#### 修正

```tsx
// ✅ 良い例
function MyComponent() {
  const [data, setData] = useState(initial);
  useEffect(() => { /* ... */ });  // 全 Hook を先に呼ぶ

  if (!data) {
    return <Loading />;  // 早期 return は Hook 後
  }
}
```

---

## 2. デバッグの定石

### 2.1 「動かない」「保存されない」系の調査手順

```
1. ブラウザの F12 → Console でエラー確認
   ├─ エラーあり → メッセージから原因特定
   └─ エラーなし → 2 へ

2. Console でアプリのデータ層を直接叩く
   ├─ IndexedDB: indexedDB.open(...).onsuccess = ...
   ├─ Firestore: window でデバッグ用に getDoc を露出させる
   └─ → データの実体を目視

3. 該当処理にデバッグログを仕込む
   ├─ console.log('[useAutoDraft] effect triggered', ...);
   ├─ ステップごとに何が起きているか可視化
   └─ パターンマッチで原因特定

4. 原因特定後にログを削除
   └─ ただし重要なエラーログ（catch 内の console.error）は残す
```

### 2.2 デバッグログの命名規則

`[ファイル名 or 機能名]` プレフィックスをつけると、Console フィルタで簡単に絞り込める：

```ts
console.log('[useAutoDraft] effect triggered', { contentType, enabled });
console.log('[useAutoDraft] saving now...');
console.error('[useAutoDraft] saveDraft failed:', error);
```

### 2.3 IndexedDB を Console から直接確認するスニペット

```js
// 全レコード取得
indexedDB.open('animalume-admin').onsuccess = function(e) {
  const db = e.target.result;
  db.transaction('drafts', 'readonly')
    .objectStore('drafts')
    .getAll().onsuccess = (ev) => {
      console.log('Records:', ev.target.result.length, ev.target.result);
    };
};

// オブジェクトストア名一覧
indexedDB.open('animalume-admin').onsuccess = (e) => {
  console.log('Stores:', Array.from(e.target.result.objectStoreNames));
};
```

### 2.4 IndexedDB のサイドパネル展開矢印（▶）が出ない場合

レコードが 0 件のときは Chrome の DevTools が展開矢印を出さないことがある。
ストア自体は存在しているので、上記スクリプトで中身を確認すること。

---

## 3. Vite + HMR の罠

### 3.1 Hooks 順序エラーが HMR で出ることがある

修正後にホットリロードした際、React 内部の Hook スロットと新しいコードのフック構造がズレて、コードは正しいのに「Hooks order error」が出ることがある。

#### 対処手順

```powershell
# 1. Vite を完全停止 (Ctrl + C)
# 2. Vite キャッシュ削除
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# 3. ブラウザのハード再読み込み（F12 開いた状態でリロードボタン右クリック）

# 4. 必要に応じて IndexedDB と localStorage をクリア
#    F12 → Application → 該当 DB / Storage を削除

# 5. Vite 再起動
pnpm dev
```

これで直らない場合は本物のコードバグ。

---

## 4. PowerShell 特有の罠

### 4.1 `&&` が使えない

PowerShell 5.1 以前では bash の `&&` が使えない：

```powershell
# ❌ 動かない
pnpm typecheck && pnpm lint && pnpm build

# ✅ セミコロン区切り（前のコマンド失敗でも次が実行される）
pnpm typecheck; pnpm lint; pnpm build

# ✅ 1 つずつ実行（推奨）
pnpm typecheck
pnpm lint
pnpm build

# ✅ PowerShell 7 (pwsh) なら && が使える
```

### 4.2 JavaScript コードを PowerShell に貼り付けない

ブラウザ DevTools 用の JS コードを PowerShell に貼り付けるとパースエラーになる。
**ブラウザの F12 → Console タブ**に貼り付けること。

### 4.3 マルチラインの引数が必要なコマンド

```powershell
# Get-Content でファイル内容をそのままクリップボードへ
Get-Content src\locales\ja\common.json -Raw | Set-Clipboard
```

`-Raw` を付けないと配列扱いされて改行が壊れる。

---

## 5. Firebase 特有の罠

### 5.1 admin custom claim の反映タイミング

`scripts/grant-admin.mjs` で role を付与した直後はトークンキャッシュのため反映されない。
**ブラウザで完全ログアウト → 再ログインが必須**。

### 5.2 `service-account.json` の管理

- ❌ Git にコミットしない
- ❌ Slack / DM で送らない
- ✅ `.gitignore` に必ず含める
- ✅ ローカル保存のみ
- 漏洩疑いがあれば Firebase Console で即座に無効化可能

### 5.3 Firestore Security Rules のデプロイ忘れ

ローカルの `firestore.rules` を更新しても、Firebase 側に反映するには明示的なデプロイが必要：

```powershell
firebase deploy --only firestore:rules
```

`Missing or insufficient permissions` が出たらまずこれを疑う。

### 5.4 匿名ユーザーと管理者の分離

Animalume では一般ユーザーは匿名認証で自動サインインされる。管理画面で匿名ユーザーを admin にしてはいけない（ブラウザキャッシュ削除等で消えるため）。

`AdminGate` で `user.isAnonymous` を未ログイン扱いにする：

```tsx
if (!user || user.isAnonymous) {
  return <Navigate to="/admin/login" />;
}
```

---

## 6. インシデント記録

### 6.1 2026-05-09 / UI 文言インポート時の自動保存無限ループ

**症状**: UI 文言エディタで JSON インポートしても IndexedDB に保存されず、リロードでデータが消える。「保存中」表示が永久に消えない。

**原因（複合）**:
1. `useAutoDraft` の `onSaved` が依存配列に入っていて、毎レンダリングで debounce タイマーがリセット
2. `UiStringsEditor` の `initial = {}` デフォルト引数で毎レンダリング新しい `{}` 参照が作られ、initial 依存の useEffect が無限再実行

**特に注意**: 1 を直しても 2 が残っており「直した気になる」罠だった。
TypeEditor / QuestionEditor で同様の症状が出なかったのは、これらが props として `initial` を受け取っていなかったため。

**教訓**: 「フックの依存配列に新規参照が来る」パターンを 1 つ見つけたら、同じファイルや関連ファイルに**もう 1 つ別パターンが潜んでいないか必ず確認する**。

詳細: §1.1 のパターン A・B を両方修正することで解決。

---

## 7. 今後 Claude Code が新機能を実装するときのチェックリスト

新しいエディタ・フック・コンポーネントを追加する前に、以下を確認すること：

### 7.1 React Hooks

- [ ] useEffect の依存配列に「毎レンダリングで新規参照になる値」が入っていないか
- [ ] props のデフォルト引数で `{}` `[]` `() => {}` を使っていないか
- [ ] コールバックを useEffect の依存配列に入れる場合、useRef パターンを使っているか
- [ ] 早期 return より後ろに Hook を呼んでいないか

### 7.2 永続化

- [ ] 自動保存系を実装した場合、ブラウザリロード後にデータが残るか実機確認
- [ ] エラー時に握り潰さず、catch で console.error にメッセージを残しているか

### 7.3 Firestore

- [ ] Security Rules を更新したか、`firebase deploy --only firestore:rules` を実行したか
- [ ] 匿名ユーザーと認証済みユーザーを正しく区別しているか

### 7.4 動作確認

- [ ] `pnpm typecheck; pnpm lint; pnpm build` がすべて成功するか
- [ ] ブラウザで実機動作確認したか（typecheck だけでは検出できないバグが多い）
- [ ] Console にエラーや警告が出ていないか

---

**Last Updated**: 2026-05-09
