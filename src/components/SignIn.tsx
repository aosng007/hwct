import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-4xl">⚖️</div>
          <h1 className="text-2xl font-semibold text-gray-800">ScaleLog</h1>
          <p className="text-sm text-gray-500">
            Track your weight and BMI over time
          </p>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={signIn}
            onError={() => alert('Sign-in failed. Please try again.')}
            useOneTap
          />
        </div>

        <p className="text-xs text-gray-400">
          Personal use only. Your data is stored in your Google Sheet.
        </p>
      </div>
    </div>
  );
}
