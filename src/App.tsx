import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import UiWrapper from './components/UiWrapper';
import './App.css';

function App() {
  const { isLoaded, isSignedIn } = useAuth();
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>{isLoaded && isSignedIn && <UiWrapper />}</SignedIn>
    </>
  );
}

export default App;
