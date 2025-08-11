import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  googleSection?: React.ReactNode;
  footer?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, googleSection, footer }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto rounded-full flex items-center justify-center mb-4 overflow-hidden" style={{ width: '128px', height: '128px' }}>
            <img
              src="/NEW-removebg-preview.png"
              alt="MoveSmart KE Logo"
              className="object-contain"
              style={{ width: '128px', height: '128px' }}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {children}

          {googleSection && (
            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with Google</span>
                </div>
              </div>
              {googleSection}
            </div>
          )}
        </div>

        {footer}
      </div>
    </div>
  );
};

export default AuthLayout;

