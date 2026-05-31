import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { HomeScreen } from '@/features/home/components/HomeScreen';
import { DiagnosisScreen } from '@/features/diagnosis/components/DiagnosisScreen';
import { ResultScreen } from '@/features/result/components/ResultScreen';
import { HistoryScreen } from '@/features/history/components/HistoryScreen';
import { CompareScreen } from '@/features/history/components/CompareScreen';
import { AdminRoutes } from '@/features/admin/routes';
import { ScreenTransition } from '@/components/motion';

function AppLayout() {
  const location = useLocation();
  return (
    // app-frame: モバイルはビューポート全体、デスクトップはスマホ枠（globals.css で制御）
    <div className="app-frame">
      <ScreenTransition routeKey={location.pathname}>
        <Outlet />
      </ScreenTransition>
    </div>
  );
}

const router = createBrowserRouter([
  // ── メインアプリ（スマホ枠内） ──────────────────────────────
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'diagnosis', element: <DiagnosisScreen /> },
      { path: 'result/:resultId', element: <ResultScreen /> },
      { path: 'history', element: <HistoryScreen /> },
      { path: 'compare', element: <CompareScreen /> },
    ],
  },
  // ── 管理画面（スマホ枠なし、フル幅） ────────────────────────
  { path: 'admin/*', element: <AdminRoutes /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
