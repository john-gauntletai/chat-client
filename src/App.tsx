import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import UiWrapper from './components/UiWrapper';
import './App.css';

function App() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <UiWrapper />
      </SignedIn>
    </>
  );
}

export default App;
