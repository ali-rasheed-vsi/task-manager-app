'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} redirectTo="/dashboard">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 animate-fade-in-up">
              TaskFlow
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Streamline your team&apos;s productivity with our powerful task management platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <a
                href="/signup"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-neutral-900 mb-12">
              Everything you need to manage tasks
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={icons.checkSquare} className="text-primary-600" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Task Management</h3>
                <p className="text-neutral-600">Create, assign, and track tasks with ease. Keep your team organized and productive.</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={icons.users} className="text-success-600" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Team Collaboration</h3>
                <p className="text-neutral-600">Work together seamlessly with real-time updates and team member management.</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={icons.zap} className="text-warning-600" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Real-time Updates</h3>
                <p className="text-neutral-600">Stay in sync with instant notifications and live updates across your team.</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-soft hover:shadow-medium transition-shadow animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={icons.shield} className="text-error-600" size="xl" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Secure & Reliable</h3>
                <p className="text-neutral-600">Your data is protected with enterprise-grade security and 99.9% uptime.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl shadow-soft p-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Ready to boost your team&apos;s productivity?
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Join thousands of teams already using TaskFlow to manage their projects efficiently.
            </p>
            <a
              href="/signup"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl inline-block"
            >
              Start Your Free Trial
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">TaskFlow</h3>
            <p className="text-neutral-400 mb-6">
              Empowering teams to achieve more through better task management.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="/login" className="text-neutral-400 hover:text-white transition-colors">
                Sign In
              </a>
              <a href="/signup" className="text-neutral-400 hover:text-white transition-colors">
                Sign Up
              </a>
            </div>
            <p className="text-neutral-500 text-sm mt-6">
              © 2025 TaskFlow. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
