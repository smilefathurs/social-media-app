'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCreatePostMutation } from '../posts.hooks';
import axios from 'axios';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function CreatePostForm() {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [validationError, setValidationError] = useState('');

  const createPostMutation = useCreatePostMutation();

  const [previewUrl, setPreviewUrl] = useState('');
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function updatePreview(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = file ? URL.createObjectURL(file) : null;

    setPreviewUrl(previewUrlRef.current ?? '');
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setValidationError('');
    createPostMutation.reset();

    if (!file) {
      setImage(null);
      updatePreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImage(null);
      updatePreview(null);
      event.target.value = '';
      setValidationError('Pilih gambar JPG, PNG, atau WEBP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImage(null);
      updatePreview(null);
      event.target.value = '';
      setValidationError('Ukuran gambar maksimal 5 MB.');
      return;
    }

    setImage(file);
    updatePreview(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError('');

    if (!image) {
      setValidationError('Pilih gambar terlebih dahulu.');
      return;
    }

    createPostMutation.mutate(
      { image, caption: caption.trim() },
      {
        onSuccess: () => {
          setImage(null);
          setCaption('');
          setValidationError('');
        },
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900'
    >
      <div>
        <h2 className='font-semibold'>Apa yang sedang kamu pikirkan?</h2>
        <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          Bagikan foto dan cerita dengan komunitasmu.
        </p>
      </div>

      <div>
        <label htmlFor='post-image' className='mb-2 block text-sm font-medium'>
          Foto <span className='text-red-500'>*</span>
        </label>

        <input
          id='post-image'
          type='file'
          accept='image/jpeg,image/png,image/webp'
          onChange={handleImageChange}
          disabled={createPostMutation.isPending}
          className='block w-full rounded-lg border border-gray-300 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700 dark:border-gray-700'
        />

        <p className='mt-1 text-xs text-gray-500'>
          JPG, PNG, atau WEBP. Maksimal 5 MB.
        </p>
      </div>

      {previewUrl && (
        <div>
          <p className='mb-2 text-sm font-medium'>Preview gambar</p>
          <Image
            src={previewUrl}
            alt='Preview postingan'
            width={1200}
            height={800}
            unoptimized
            className='max-h-80 w-full rounded-lg border border-gray-200 object-contain dark:border-gray-700'
          />
        </div>
      )}

      <div>
        <label
          htmlFor='post-caption'
          className='mb-2 block text-sm font-medium'
        >
          Caption
        </label>
        <textarea
          id='post-caption'
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder='Ceritakan sesuatu...'
          rows={3}
          disabled={createPostMutation.isPending}
          className='w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:focus:ring-blue-950'
        />
      </div>

      {(validationError || createPostMutation.isError) && (
        <p role='alert' className='text-sm text-red-600'>
          {validationError ||
            (axios.isAxiosError(createPostMutation.error)
              ? JSON.stringify(
                  createPostMutation.error.response?.data ??
                    createPostMutation.error.message
                )
              : 'Postingan gagal dibuat. Silakan coba lagi.')}
        </p>
      )}

      {createPostMutation.isSuccess && (
        <p role='status' className='text-sm text-green-600'>
          Postingan berhasil dibuat!
        </p>
      )}

      <button
        type='submit'
        disabled={!image || createPostMutation.isPending}
        className='w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {createPostMutation.isPending ? 'Mempublikasikan...' : 'Publikasikan'}
      </button>
    </form>
  );
}
