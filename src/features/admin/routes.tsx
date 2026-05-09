import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AdminGate } from './auth/AdminGate';
import { AdminLogin } from './auth/AdminLogin';
import { AdminShell, AdminListContainer } from './layout/AdminShell';
import { TypeList } from './lists/TypeList';
import { QuestionList } from './lists/QuestionList';
import { UiStringsList } from './lists/UiStringsList';
import { TypeEditor } from './types/TypeEditor';
import { QuestionEditor } from './questions/QuestionEditor';
import { UiStringsEditor } from './ui-strings/UiStringsEditor';
import type { MbtiType } from './shared/source-types';

export function AdminRoutes() {
  return (
    <Routes>
      {/* ログイン画面はガードの外側 */}
      <Route path="login" element={<AdminLogin />} />

      {/* それ以外は AdminGate 配下 */}
      <Route path="*" element={<GuardedRoutes />} />
    </Routes>
  );
}

function GuardedRoutes() {
  return (
    <AdminGate>
      <Routes>
        <Route element={<AdminShell />}>
          <Route index element={<TypeListPage />} />
          <Route path="types" element={<TypeListPage />} />
          <Route path="questions" element={<QuestionListPage />} />
          <Route path="ui-strings" element={<UiStringsListPage />} />
          <Route path="types/:typeCode" element={<TypeEditorPage />} />
          <Route path="questions/:questionId" element={<QuestionEditorPage />} />
          <Route path="ui-strings/edit" element={<UiStringsEditorPage />} />
        </Route>
      </Routes>
    </AdminGate>
  );
}

function TypeListPage() {
  return (
    <AdminListContainer>
      <TypeList />
    </AdminListContainer>
  );
}
function QuestionListPage() {
  return (
    <AdminListContainer>
      <QuestionList />
    </AdminListContainer>
  );
}
function UiStringsListPage() {
  return (
    <AdminListContainer>
      <UiStringsList />
    </AdminListContainer>
  );
}

function TypeEditorPage() {
  const { typeCode } = useParams();
  const navigate = useNavigate();
  return (
    <TypeEditor
      typeCode={(typeCode ?? 'INTJ') as MbtiType}
      onBack={() => navigate('/admin/types')}
    />
  );
}

function QuestionEditorPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  return (
    <QuestionEditor
      questionId={questionId ?? ''}
      onBack={() => navigate('/admin/questions')}
    />
  );
}

function UiStringsEditorPage() {
  const navigate = useNavigate();
  return (
    <UiStringsEditor onBack={() => navigate('/admin/ui-strings')} />
  );
}
