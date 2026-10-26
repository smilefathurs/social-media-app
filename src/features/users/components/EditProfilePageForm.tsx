'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setCredentials } from '@/features/auth/auth.slice';
import { saveAuthSession } from '@/features/auth/auth-storage';
import type { AuthUser } from '@/features/auth/auth.types';
import type { UserProfile } from '@/features/users/users-profile.types';
import { useUpdateMyProfileMutation } from '@/features/users/users-profile-update.hooks';

interface Props {
  profile: UserProfile;
}

type Fields = 'name' | 'username' | 'phone';

const inputClass =
  'w-full rounded-xl border bg-[#211e29] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-500 disabled:opacity-60';

export default function EditProfilePageForm({ profile }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const mutation = useUpdateMyProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [phone, setPhone] = useState(authUser?.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl('');
    setAvatar(null);
    setFormError('');
    mutation.reset();

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Select a JPG, PNG, or WEBP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must not exceed 5 MB.');
      event.target.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setAvatar(file);
    setPreviewUrl(url);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const nextErrors: Partial<Record<Fields, string>> = {};
    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) nextErrors.name = 'Name is required.';
    if (!cleanUsername) {
      nextErrors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      nextErrors.username = 'Use letters, numbers, periods, or underscores.';
    }

    if (cleanUsername.length > 30) {
      nextErrors.username = 'Username must not exceed 30 characters.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutation.mutate(
      {
        name: cleanName,
        username: cleanUsername,
        phone: cleanPhone,
        bio: bio.trim(),
        avatar,
      },
      {
        onSuccess: (response) => {
          if (authUser && token) {
            const updatedUser: AuthUser = {
              ...authUser,
              name: response.data?.name ?? cleanName,
              username: response.data?.username ?? cleanUsername,
              phone: response.data?.phone ?? cleanPhone,
              avatarUrl: response.data?.avatarUrl ?? authUser.avatarUrl,
            };

            const session = { token, user: updatedUser };
            saveAuthSession(session);
            dispatch(setCredentials(session));
          }

          router.replace(
            `/users/${encodeURIComponent(response.data?.username ?? cleanUsername)}?profileUpdated=1`
          );
          router.refresh();
        },
      }
    );
  }

  function getMutationError() {
    if (!mutation.error) return 'Failed to update profile. Please try again.';

    if (axios.isAxiosError(mutation.error)) {
      const data = mutation.error.response?.data as
        | { message?: string; error?: string; data?: { message?: string } }
        | undefined;

      return (
        data?.message ??
        data?.error ??
        data?.data?.message ??
        (mutation.error.response?.status === 409
          ? 'Username is already taken.'
          : 'Failed to update profile. Check your information and connection.')
      );
    }

    return 'Failed to update profile. Please try again.';
  }

  const currentAvatar = previewUrl || profile.avatarUrl;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='grid gap-8 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-12'
    >
      <section className='flex flex-col items-center sm:items-start'>
        <div className='relative size-32 overflow-hidden rounded-full border border-white/10 bg-[#211e29] sm:size-40'>
          {currentAvatar ? (
            <Image
              src={currentAvatar}
              alt='Profile picture'
              fill
              unoptimized
              sizes='160px'
              className='object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center text-5xl font-semibold text-purple-300'>
              {name.trim().charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={mutation.isPending}
          className='mt-4 cursor-pointer rounded-xl border border-purple-400/40 px-5 py-2.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Change Photo
        </button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          onChange={handleAvatarChange}
          className='hidden'
          aria-label='Select profile picture'
        />
        <p className='mt-2 text-center text-xs text-white/40 sm:text-left'>
          JPG, PNG, or WEBP · Max. 5 MB
        </p>
      </section>

      <section className='min-w-0 space-y-5'>
        <Field label='Name' error={errors.name}>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            maxLength={100}
            disabled={mutation.isPending}
            className={`${inputClass} ${errors.name ? 'border-pink-500' : 'border-white/10'}`}
          />
        </Field>

        <Field label='Username' error={errors.username}>
          <div className='flex items-center rounded-xl border border-white/10 bg-[#211e29] focus-within:border-purple-500'>
            <span className='pl-4 text-sm text-white/40'>@</span>
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              maxLength={30}
              disabled={mutation.isPending}
              className='w-full min-w-0 bg-transparent px-2 py-3 text-sm text-white outline-none'
            />
          </div>
        </Field>

        <Field label='Email'>
          <input
            value={authUser?.email ?? ''}
            readOnly
            aria-readonly='true'
            className={`${inputClass} cursor-not-allowed border-white/10 text-white/50`}
          />
          <p className='mt-1 text-xs text-white/40'>
            Email tidak dapat diubah di sini.
          </p>
        </Field>

        <Field label='Number Phone'>
          <input
            type='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            disabled={mutation.isPending}
            className={`${inputClass} border-white/10`}
          />
        </Field>

        <Field label='Bio'>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            disabled={mutation.isPending}
            placeholder='Tell us a little about yourself'
            className={`${inputClass} resize-y border-white/10`}
          />
        </Field>

        {formError && (
          <p role='alert' className='text-sm text-pink-400'>
            {formError}
          </p>
        )}

        {mutation.isError && (
          <p role='alert' className='text-sm text-pink-400'>
            {getMutationError()}
          </p>
        )}

        <button
          type='submit'
          disabled={mutation.isPending}
          className='w-full cursor-pointer rounded-xl bg-purple-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {mutation.isPending ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </section>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className='mb-2 block text-sm font-medium text-white/85'>
        {label}
      </label>
      {children}
      {error && <p className='mt-1.5 text-xs text-pink-400'>{error}</p>}
    </div>
  );
}
