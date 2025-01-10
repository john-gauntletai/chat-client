import { SignedIn, SignedOut, useAuth, SignIn } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UiWrapper from './components/UiWrapper';
import { useEffect } from 'react';
import './App.css';

function SignInPage() {
  const { signOut, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      signOut();
    }
  }, [isSignedIn, signOut]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <SignIn routing="path" path="/signin" />
    </div>
  );
}

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signin"
          element={
            <SignedOut>
              <SignInPage />
            </SignedOut>
          }
        />
        <Route
          path="/*"
          element={
            <>
              <SignedOut>
                <LandingPage />
              </SignedOut>
              <SignedIn>{isLoaded && isSignedIn && <UiWrapper />}</SignedIn>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
