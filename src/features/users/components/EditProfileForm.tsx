'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setCredentials } from '@/features/auth/auth.slice';
import { saveAuthSession } from '@/features/auth/auth-storage';
import type { AuthUser } from '@/features/auth/auth.types';
import type { UserProfile } from '../users-profile.types';
import { useUpdateMyProfileMutation } from '../users-profile-update.hooks';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface EditProfileFormProps {
  profile: UserProfile;
}

export default function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const mutation = useUpdateMyProfileMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [phone, setPhone] = useState(authUser?.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function resetForm() {
    setName(profile.name);
    setUsername(profile.username);
    setPhone(authUser?.phone ?? '');
    setBio(profile.bio ?? '');
    setAvatar(null);
    setPreviewUrl('');
    setValidationError('');
    mutation.reset();

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setValidationError('');
    mutation.reset();

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setAvatar(null);
    setPreviewUrl('');

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      event.target.value = '';
      setValidationError('Pilih gambar JPG, PNG, atau WEBP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      event.target.value = '';
      setValidationError('Ukuran avatar maksimal 5 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setAvatar(file);
    setPreviewUrl(url);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedPhone = phone.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName || !trimmedUsername) {
      setValidationError('Nama dan username wajib diisi.');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(trimmedUsername)) {
      setValidationError(
        'Username hanya boleh berisi huruf, angka, titik, dan underscore.',
      );
      return;
    }

    mutation.mutate(
      {
        name: trimmedName,
        username: trimmedUsername,
        phone: trimmedPhone,
        bio: trimmedBio,
        avatar,
      },
      {
        onSuccess: (response) => {
          const currentUser = authUser;

          if (currentUser && token) {
            const updatedUser: AuthUser = {
              ...currentUser,
              
              name: response.data?.name ?? trimmedName,
              username: response.data?.username ?? trimmedUsername,
              phone: response.data?.phone ?? trimmedPhone,
              avatarUrl: response.data?.avatarUrl ?? currentUser.avatarUrl,
            };

            const session = { token, user: updatedUser };
            saveAuthSession(session);
            dispatch(setCredentials(session));
          }

          setIsOpen(false);
          router.replace(`/users/${encodeURIComponent(
            response.data?.username ?? trimmedUsername,
          )}`);
          router.refresh();
        },
      },
    );
  }

  function getErrorMessage(): string {
    if (validationError) return validationError;

    if (!mutation.error) {
      return 'Gagal memperbarui profil. Silakan coba lagi.';
    }

    if (axios.isAxiosError(mutation.error)) {
      const responseData = mutation.error.response?.data as
        | {
            message?: string;
            error?: string;
            data?: {
              message?: string;
              error?: string;
            } | null;
          }
        | undefined;

      const apiMessage =
        responseData?.message ??
        responseData?.error ??
        responseData?.data?.message ??
        responseData?.data?.error;

      if (apiMessage) return apiMessage;

      if (mutation.error.response?.status === 400) {
        return 'Data tidak valid atau username sudah digunakan. Periksa kembali username Anda.';
      }

      if (mutation.error.response?.status === 409) {
        return 'Username sudah digunakan. Silakan pilih username lain.';
      }

      return 'Gagal memperbarui profil. Periksa koneksi dan coba lagi.';
    }

    return 'Gagal memperbarui profil. Silakan coba lagi.';
  }

  return (
    <div className="mt-4">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          Edit Profil
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950"
        >
          <h2 className="text-lg font-semibold">Edit Profil</h2>

          <div>
            <label htmlFor="edit-profile-name" className="mb-1 block text-sm font-medium">
              Nama
            </label>
            <input
              id="edit-profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              disabled={mutation.isPending}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label htmlFor="edit-profile-username" className="mb-1 block text-sm font-medium">
              Username
            </label>
            <input
              id="edit-profile-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              maxLength={30}
              disabled={mutation.isPending}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              Gunakan huruf, angka, titik, atau underscore.
            </p>
          </div>

          <div>
            <label htmlFor="edit-profile-phone" className="mb-1 block text-sm font-medium">
              Nomor telepon
            </label>
            <input
              id="edit-profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={30}
              disabled={mutation.isPending}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label htmlFor="edit-profile-bio" className="mb-1 block text-sm font-medium">
              Bio
            </label>
            <textarea
              id="edit-profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              maxLength={500}
              disabled={mutation.isPending}
              placeholder="Ceritakan sedikit tentang dirimu..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label htmlFor="edit-profile-avatar" className="mb-1 block text-sm font-medium">
              Avatar
            </label>
            <input
              ref={fileInputRef}
              id="edit-profile-avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              disabled={mutation.isPending}
              className="block w-full rounded-lg border border-gray-300 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700 dark:border-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, atau WEBP. Maksimal 5 MB. Kosongkan jika tidak ingin mengganti avatar.
            </p>

            {(previewUrl || profile.avatarUrl) && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-gray-500">
                  {previewUrl ? 'Preview avatar baru' : 'Avatar saat ini'}
                </p>
                <Image
                  src={previewUrl || profile.avatarUrl!}
                  alt="Preview avatar profil"
                  width={96}
                  height={96}
                  unoptimized
                  className="size-24 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                />
              </div>
            )}
          </div>

          {(validationError || mutation.isError) && (
            <p role="alert" className="text-sm text-red-600">
              {getErrorMessage()}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

