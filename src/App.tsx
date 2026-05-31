import { MotionProvider, DEFAULT_MOTION } from '@/components/motion';
import { AppRouter } from '@/routes';

export default function App() {
  return (
    <MotionProvider value={DEFAULT_MOTION}>
      <AppRouter />
    </MotionProvider>
  );
}
