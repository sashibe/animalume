import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { HomeScreen } from '@/features/home/components/HomeScreen';
import { DiagnosisScreen } from '@/features/diagnosis/components/DiagnosisScreen';
import { ResultScreen } from '@/features/result/components/ResultScreen';
import { ScreenTransition } from '@/components/motion';

function AppLayout() {
  const location = useLocation();
  return (
    <ScreenTransition routeKey={location.pathname}>
      <Outlet />
    </ScreenTransition>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'diagnosis', element: <DiagnosisScreen /> },
      { path: 'result/:resultId', element: <ResultScreen /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
