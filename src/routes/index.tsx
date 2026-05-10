import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomeScreen } from '@/features/home/components/HomeScreen';
import { DiagnosisScreen } from '@/features/diagnosis/components/DiagnosisScreen';
import { ResultScreen } from '@/features/result/components/ResultScreen';
import { HistoryScreen } from '@/features/history/components/HistoryScreen';
import { CompareScreen } from '@/features/history/components/CompareScreen';
import { AdminRoutes } from '@/features/admin/routes';

const router = createBrowserRouter([
  { path: '/', element: <HomeScreen /> },
  { path: '/diagnosis', element: <DiagnosisScreen /> },
  { path: '/result/:resultId', element: <ResultScreen /> },
  { path: '/history', element: <HistoryScreen /> },
  { path: '/compare', element: <CompareScreen /> },
  { path: '/admin/*', element: <AdminRoutes /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
