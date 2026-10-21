'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ImagePlus,
  Upload,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCreatePostMutation } from '../posts.hooks';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function CreatePostForm() {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [imageError, setImageError] = useState('');
  const [captionError, setCaptionError] = useState('');
  const [showCaptionError, setShowCaptionError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const router = useRouter();
  const createPostMutation = useCreatePostMutation();

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

    const nextUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl ?? '');
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setImageError('');
    createPostMutation.reset();

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImage(null);
      updatePreview(null);
      setImageError('Pilih gambar JPG, PNG, atau WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setImage(null);
      updatePreview(null);
      setImageError('Ukuran gambar maksimal 5 MB.');
      event.target.value = '';
      return;
    }

    setImage(file);
    updatePreview(file);
  }

  function handleDeleteImage() {
    setImage(null);
    setImageError('');
    updatePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setImageError('');
    setCaptionError('');
    setShowCaptionError(false);

    if (!image) {
      setImageError('Pilih gambar terlebih dahulu.');
    }

    if (!caption.trim()) {
      setCaptionError('Caption tidak boleh kosong.');
      setShowCaptionError(true);
    }

    if (!image || !caption.trim()) return;

    createPostMutation.mutate(
      { image, caption: caption.trim() },
      {
        onSuccess: () => {
          setImage(null);
          setCaption('');
          setImageError('');
          setCaptionError('');
          updatePreview(null);

          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }

          router.push('/?postSuccess=1');
        },
      }
    );
  }

  const mutationError = createPostMutation.isError
    ? axios.isAxiosError(createPostMutation.error)
      ? typeof createPostMutation.error.response?.data === 'string'
        ? createPostMutation.error.response.data
        : (createPostMutation.error.response?.data?.message ??
          createPostMutation.error.message)
      : 'Postingan gagal dibuat. Silakan coba lagi.'
    : '';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='w-full space-y-6 text-white'
    >
      <section>
        <label
          htmlFor='post-image'
          className='mb-3 block text-sm font-medium text-white'
        >
          Photo
        </label>

        <input
          ref={imageInputRef}
          id='post-image'
          type='file'
          accept='image/jpeg,image/png,image/webp'
          onChange={handleImageChange}
          disabled={createPostMutation.isPending}
          className='sr-only'
        />

        {!previewUrl ? (
          <button
            type='button'
            onClick={() => imageInputRef.current?.click()}
            disabled={createPostMutation.isPending}
            className={`flex min-h-[196px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-[#17171c] px-4 py-6 text-center transition hover:bg-[#1d1b24] ${
              imageError
                ? 'border-[#ff4fa3]'
                : 'border-white/20 hover:border-purple-400'
            }`}
          >
            <span className='flex size-12 items-center justify-center rounded-xl bg-white/10'>
              <ImagePlus className='size-6 text-white' />
            </span>

            <span className='text-sm font-medium text-white'>
              Drag photo here or click to upload
            </span>

            <span className='text-xs text-white/45'>
              JPG, PNG or WEBP (max 5 MB)
            </span>
          </button>
        ) : (
          <div className='rounded-lg bg-[#17171c] p-3'>
            <div className='relative h-[260px] w-full overflow-hidden rounded-md bg-black sm:h-[320px]'>
              <Image
                src={previewUrl}
                alt='Preview postingan'
                fill
                unoptimized
                sizes='(max-width: 640px) 100vw, 452px'
                className='object-contain'
              />
            </div>

            <div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
              <button
                type='button'
                onClick={() => imageInputRef.current?.click()}
                disabled={createPostMutation.isPending}
                className='inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50'
              >
                <RefreshCw className='size-4' />
                Change Image
              </button>

              <button
                type='button'
                onClick={handleDeleteImage}
                disabled={createPostMutation.isPending}
                className='inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-[#ff4fa3] transition hover:bg-[#ff4fa3]/10 disabled:opacity-50'
              >
                <Trash2 className='size-4' />
                Delete Image
              </button>
            </div>
          </div>
        )}

        {imageError && (
          <p role='alert' className='mt-2 text-xs text-[#ff4fa3]'>
            {imageError}
          </p>
        )}
      </section>

      <section>
        <div className='mb-3 flex items-center justify-between'>
          <label
            htmlFor='post-caption'
            className='text-sm font-medium text-white'
          >
            Caption
          </label>

          <button
            type='button'
            onClick={() => setShowCaptionError((previous) => !previous)}
            aria-label={
              showCaptionError ? 'Sembunyikan indikator' : 'Tampilkan indikator'
            }
            className='text-white/70 transition hover:text-white'
          >
            {showCaptionError ? (
              <EyeOff className='size-4' />
            ) : (
              <Eye className='size-4' />
            )}
          </button>
        </div>

        <textarea
          id='post-caption'
          value={caption}
          onChange={(event) => {
            setCaption(event.target.value);
            if (event.target.value.trim()) {
              setCaptionError('');
              setShowCaptionError(false);
            }
          }}
          placeholder='Create your caption'
          rows={4}
          disabled={createPostMutation.isPending}
          className={`min-h-[116px] w-full resize-y rounded-lg border bg-[#17171c] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/40 focus:ring-1 ${
            captionError
              ? 'border-[#ff4fa3] focus:border-[#ff4fa3] focus:ring-[#ff4fa3]'
              : 'border-white/15 focus:border-purple-500 focus:ring-purple-500'
          }`}
        />

        {captionError && (
          <p role='alert' className='mt-2 text-xs text-[#ff4fa3]'>
            {captionError}
          </p>
        )}
      </section>

      {mutationError && (
        <p role='alert' className='text-sm text-[#ff4fa3]'>
          {mutationError}
        </p>
      )}

      <button
        type='submit'
        disabled={!image || createPostMutation.isPending}
        className='flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {createPostMutation.isPending ? (
          <>
            <Upload className='size-4 animate-pulse' />
            Sharing...
          </>
        ) : (
          <>
            <Upload className='size-4' />
            Share
          </>
        )}
      </button>

      {createPostMutation.isError && (
        <button
          type='button'
          onClick={() => createPostMutation.reset()}
          className='mx-auto flex items-center gap-2 text-xs text-white/50 hover:text-white'
        >
          <X className='size-3' />
          Tutup pesan error
        </button>
      )}
    </form>
  );
}
