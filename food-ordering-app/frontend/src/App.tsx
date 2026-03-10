import { AuthProvider } from './context';
import { AppRouter } from './router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
