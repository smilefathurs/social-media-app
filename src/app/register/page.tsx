'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerFormSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from '@/features/auth/auth.schema';
import { useRegisterMutation } from '@/features/auth/auth.hooks';

function SocialityLogo() {
  return (
    <Link
      href='/'
      aria-label='Sociality22 - Back to Timeline'
      className='inline-flex items-center justify-center gap-3 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500'
    >
      <Image
        src='/images/sociality-logo.png'
        alt='Sociality22 Logo'
        width={40}
        height={40}
        priority
        className='h-10 w-10 object-contain'
      />
      <span className='text-2xl font-bold tracking-tight text-[#FDFDFD]'>
        Sociality22
      </span>
    </Link>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      className='h-5 w-5'
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z'
      />
      <circle cx='12' cy='12' r='3' />
      {visible && <path strokeLinecap='round' d='M4 4 20 20' />}
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-[#0b0e13] px-4 py-3 text-base
    text-white placeholder:text-[#555b67] outline-none transition
    focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
    ${
      hasError
        ? 'border-pink-600 focus:border-pink-500 focus:ring-pink-500/20'
        : 'border-[#1b222d] hover:border-[#343b49]'
    }`;

  const onSubmit = (values: RegisterFormInput) => {
    setSuccessMessage('');

    // Confirm password is for client-side validation only.
    const { confirmPassword, ...payload } = values;
    void confirmPassword;

    registerMutation.mutate(payload as RegisterFormValues, {
      onSuccess: (response) => {
        if (response?.success) {
          setSuccessMessage(
            response.message || 'Registration successful. Please log in.'
          );
          router.push('/login');
        }
      },
    });
  };

  const fields = [
    {
      name: 'name',
      label: 'Name',
      placeholder: 'Enter your name',
      type: 'text',
      autoComplete: 'name',
    },
    {
      name: 'username',
      label: 'Username',
      placeholder: 'Enter your username',
      type: 'text',
      autoComplete: 'username',
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      type: 'email',
      autoComplete: 'email',
    },
    {
      name: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      type: 'tel',
      autoComplete: 'tel',
    },
  ] as const;

  return (
    <main className='relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 sm:px-6'>
      {/* Background: same visual style as Login */}
      <div
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 -z-10'
        style={{
          background: `
            radial-gradient(
              ellipse 75% 48% at 0% 100%,
              rgba(109, 40, 217, 0.95) 0%,
              rgba(76, 29, 149, 0.65) 40%,
              transparent 100%
            ),
            radial-gradient(
              ellipse 70% 45% at 100% 100%,
              rgba(126, 34, 206, 0.8) 0%,
              rgba(76, 29, 149, 0.5) 45%,
              transparent 100%
            ),
            linear-gradient(
              to bottom,
              #000000 0%,
              #000000 35%,
              #08020f 58%,
              #160525 78%,
              #21063d 100%
            )
          `,
        }}
      />

      {/* Reuse the meteor animation defined in globals.css */}
      <div className='meteor-layer' aria-hidden='true'>
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className={`meteor meteor-${i + 1}`} />
        ))}
      </div>

      <section className='relative z-10 my-auto w-full max-w-[456px] rounded-2xl border border-white/[0.06] bg-black/60 p-6 shadow-2xl shadow-purple-950/10 backdrop-blur-sm sm:p-8'>
        <header className='mb-7 text-center'>
          <SocialityLogo />
          <h1 className='mt-6 text-2xl font-bold tracking-tight text-white'>
            Create Account
          </h1>
          <p className='mt-2 text-sm text-gray-400'>
            Join Sociality22 and connect with others
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className='space-y-4'
        >
          {fields.map((field) => {
            const fieldName = field.name;
            const error = errors[fieldName];

            return (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className='mb-2 block text-sm font-semibold text-white'
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${field.name}-error` : undefined}
                  {...register(field.name)}
                  className={inputClass(Boolean(error))}
                />
                {error?.message && (
                  <p
                    id={`${field.name}-error`}
                    className='mt-2 text-sm text-pink-500'
                  >
                    {error.message}
                  </p>
                )}
              </div>
            );
          })}

          {/* Password */}
          <div>
            <label
              htmlFor='password'
              className='mb-2 block text-sm font-semibold text-white'
            >
              Password
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='Enter your password'
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...register('password')}
                className={`${inputClass(Boolean(errors.password))} pr-12`}
              />
              <button
                type='button'
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className='absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {errors.password && (
              <p id='password-error' className='mt-2 text-sm text-pink-500'>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor='confirmPassword'
              className='mb-2 block text-sm font-semibold text-white'
            >
              Confirm Password
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete='new-password'
                placeholder='Confirm your password'
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? 'confirmPassword-error' : undefined
                }
                {...register('confirmPassword')}
                className={`${inputClass(Boolean(errors.confirmPassword))} pr-12`}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
                aria-pressed={showConfirmPassword}
                className='absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id='confirmPassword-error'
                className='mt-2 text-sm text-pink-500'
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {registerMutation.isError && (
            <p role='alert' className='text-sm text-pink-500'>
              Registration failed. Check your information and try again.
            </p>
          )}

          {registerMutation.isSuccess && !registerMutation.data?.success && (
            <p role='alert' className='text-sm text-pink-500'>
              {registerMutation.data?.message ||
                'Registration failed. Please check your information.'}
            </p>
          )}

          {successMessage && (
            <p role='status' className='text-sm text-emerald-400'>
              {successMessage}
            </p>
          )}

          <button
            type='submit'
            disabled={registerMutation.isPending}
            className='w-full rounded-full bg-violet-600 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60'
          >
            {registerMutation.isPending ? 'Creating account...' : 'Submit'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-white sm:text-base'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='text-violet-500 transition hover:text-violet-400'
          >
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
