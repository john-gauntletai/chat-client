import { SignInButton } from '@clerk/clerk-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,transparent)] bg-top"></div>
        <div className="absolute top-0 w-full -translate-x-1/2 left-1/2 h-96 bg-gradient-to-br from-violet-400/30 to-purple-400/30 blur-3xl"></div>

        {/* Navigation */}
        <nav className="relative z-10 px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              FlowAI Chat
            </div>
            <div className="flex gap-4">
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-outline">Sign In</button>
              </SignInButton>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-4 pt-20 pb-32 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-8 text-5xl font-bold tracking-tight md:text-6xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Transform Your Team Communication
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mb-12 text-xl text-gray-600">
              Experience the future of team collaboration with AI-powered
              insights, real-time messaging, and intelligent workflows designed
              for modern startups.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg">
                  Start Free Trial
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="btn btn-outline btn-lg">
                  Schedule Demo
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="p-6 border border-gray-100 shadow-xl rounded-2xl bg-white/50 backdrop-blur-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Get intelligent suggestions and automate routine tasks with our
              advanced AI assistant.
            </p>
          </div>

          <div className="p-6 border border-gray-100 shadow-xl rounded-2xl bg-white/50 backdrop-blur-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-lg">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              Real-time Collaboration
            </h3>
            <p className="text-gray-600">
              Seamless communication across teams with instant messaging and
              thread discussions.
            </p>
          </div>

          <div className="p-6 border border-gray-100 shadow-xl rounded-2xl bg-white/50 backdrop-blur-lg">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-pink-100 rounded-lg">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold">Smart Workflows</h3>
            <p className="text-gray-600">
              Streamline your processes with customizable workflows and
              integrations.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-24 bg-white/70 backdrop-blur-lg">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <p className="mb-8 text-gray-600">
            Trusted by innovative teams worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50">
            {/* Add company logos here */}
            <div className="h-8">Company 1</div>
            <div className="h-8">Company 2</div>
            <div className="h-8">Company 3</div>
            <div className="h-8">Company 4</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-24 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <h2 className="mb-8 text-4xl font-bold">
          Ready to transform your team communication?
        </h2>
        <p className="max-w-2xl mx-auto mb-12 text-xl text-gray-600">
          Join thousands of teams already using FlowAI Chat to streamline their
          communication and boost productivity.
        </p>
        <button className="btn btn-primary btn-lg">Get Started for Free</button>
      </div>
    </div>
  );
};

export default LandingPage;
