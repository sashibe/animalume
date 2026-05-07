import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomeScreen } from '@/features/home/components/HomeScreen';
import { DiagnosisScreen } from '@/features/diagnosis/components/DiagnosisScreen';
import { ResultScreen } from '@/features/result/components/ResultScreen';

const router = createBrowserRouter([
  { path: '/', element: <HomeScreen /> },
  { path: '/diagnosis', element: <DiagnosisScreen /> },
  { path: '/result/:resultId', element: <ResultScreen /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
