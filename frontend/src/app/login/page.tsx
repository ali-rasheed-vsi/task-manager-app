'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoginSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      console.log('🚀 Login form submitted with values:', { email: values.email, password: '***' });
      console.log('📝 Form validation state:', { isValid: formik.isValid, errors: formik.errors, touched: formik.touched });
      
      try {
        console.log('🔄 Calling login function...');
        await login(values.email, values.password);
        console.log('✅ Login function completed successfully');
        // No need to manually redirect - ProtectedRoute will handle it
      } catch (error) {
        console.error('❌ Login function failed:', error);
        // Error is handled by the auth context
      } finally {
        console.log('🏁 Login form submission finished');
        setSubmitting(false);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600">
              Sign in to your account to continue
            </p>
          </div>

          <Card className="animate-fade-in-up">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                leftIcon={<Icon icon={icons.envelope} size="sm" />}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                  leftIcon={<Icon icon={icons.lock} size="sm" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Icon icon={showPassword ? icons.eyeSlash : icons.eye} size="sm" />
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full text-black"
                isLoading={formik.isSubmitting}
                disabled={formik.isSubmitting}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LoginPage;
