import { useAuth } from './contexts/AuthContext';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <SignIn />;
}

export default App;

