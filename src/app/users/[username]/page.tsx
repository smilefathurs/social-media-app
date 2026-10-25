'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/features/users/users.hooks';
import EditProfileForm from '@/features/users/components/EditProfileForm';
import {
  useUserPostsQuery,
  useUserProfileQuery,
} from '@/features/users/users-profile.hooks';
import {
  useSavedPostsQuery,
  usePostDetailQuery,
} from '@/features/posts/posts.hooks';
import type { Post, SavedPost } from '@/features/posts/posts.types';
import PostCommentsModal from '@/features/posts/components/PostCommentsModal';
import SocialityNavbar from '@/components/SocialityNavbar';
import ProfileBottomNav from '@/components/ProfileBottomNav';

type ProfileTab = 'gallery' | 'saved';

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="size-6" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="size-5" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.1" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="size-5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="size-5" aria-hidden="true">
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
    </svg>
  );
}

function Avatar({
  src,
  name,
  size = 'large',
}: {
  src: string | null;
  name: string;
  size?: 'large' | 'small';
}) {
  const sizeClass = size === 'large' ? 'size-24 sm:size-28' : 'size-9';

  if (src) {
    return (
      <Image
        src={src}
        alt={`Avatar ${name}`}
        width={size === 'large' ? 112 : 36}
        height={size === 'large' ? 112 : 36}
        unoptimized
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-300 ${size === 'large' ? 'text-3xl' : 'text-sm'}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function PostTile({
  post,
  username,
  onClick,
}: {
  post: Post | SavedPost;
  username: string;
  onClick: () => void;
}) {
  return (
    <article
      className="group relative aspect-square overflow-hidden rounded-md bg-[#211e29]"
    >
      {post.imageUrl ? (
        <Image
          src={post.imageUrl}
          alt={post.caption || `Postingan ${username}`}
          fill
          unoptimized
          sizes="(max-width: 640px) 33vw, 270px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-3 text-center text-xs text-white/50">
          {post.caption || 'Postingan tanpa gambar'}
        </div>
      )}
      {post.caption && (
        <div className="absolute inset-x-0 bottom-0 line-clamp-3 bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-8 text-xs text-white opacity-0 transition group-hover:opacity-100">
          {post.caption}
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={`Buka postingan ${username}: ${post.caption || 'tanpa caption'}`}
        className="absolute inset-0 z-10 cursor-pointer"
      >
        <span className="sr-only">Buka postingan</span>
      </button>
    </article>
  );
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const [activeTab, setActiveTab] = useState<ProfileTab>('gallery');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedSavedPostId, setSelectedSavedPostId] = useState<number | null>(null);

  const profileQuery = useUserProfileQuery(username);
  const postsQuery = useUserPostsQuery(username);
  const profile = profileQuery.data?.data;
  const savedQuery = useSavedPostsQuery(
    { page: 1, limit: 20 },
    Boolean(profile?.isMe) && activeTab === 'saved'
  );
  const postDetailQuery = usePostDetailQuery(
    selectedSavedPostId ?? 0,
    selectedSavedPostId !== null
  );

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const posts = postsQuery.data?.data.posts ?? [];
  const savedPosts = savedQuery.data?.data.posts ?? [];
  const isFollowPending = followMutation.isPending || unfollowMutation.isPending;

  function handleFollowToggle() {
    if (!profile || isFollowPending || profile.isMe) return;

    const mutation = profile.isFollowing ? unfollowMutation : followMutation;
    mutation.mutate(profile.username, {
      onSuccess: () => profileQuery.refetch(),
    });
  }

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${profile?.name || username}`,
          url,
        });
      } catch {
        // Pengguna mungkin membatalkan dialog berbagi.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      window.alert('Tautan profil berhasil disalin.');
    } catch {
      window.alert('Tidak dapat menyalin tautan profil pada browser ini.');
    }
  }

  if (profileQuery.isPending) {
    return (
      <main className="min-h-screen bg-[#0d0b11] px-4 py-10 text-white">
        <div className="mx-auto max-w-[812px] text-sm text-white/60">
          Memuat profil pengguna...
        </div>
      </main>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <main className="min-h-screen bg-[#0d0b11] px-4 py-10 text-white">
        <div className="mx-auto max-w-[812px] rounded-2xl border border-white/10 bg-[#17151d] p-6">
          <h1 className="text-lg font-semibold">Profil tidak dapat dimuat</h1>
          <p className="mt-2 text-sm text-white/60">
            Pengguna mungkin tidak ditemukan atau terjadi masalah koneksi.
          </p>
          <Link href="/" className="mt-5 inline-flex rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500">
            Kembali ke Home
          </Link>
        </div>
      </main>
    );
  }

  const displayName = profile.name || profile.username;
  const visiblePosts = activeTab === 'gallery' ? posts : savedPosts;
  const isContentPending = activeTab === 'gallery' ? postsQuery.isPending : savedQuery.isPending;
  const isContentError = activeTab === 'gallery' ? postsQuery.isError : savedQuery.isError;
  const hasContent = visiblePosts.length > 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0d0b11] pb-28 text-white sm:pb-12">
      <div className="hidden sm:block">
        <SocialityNavbar />
      </div>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0d0b11]/95 px-4 backdrop-blur-xl sm:hidden">
        <Link href="/" aria-label="Kembali" className="flex size-10 items-center justify-center text-white/85">
          <BackIcon />
        </Link>
        <h1 className="max-w-[65%] truncate text-base font-semibold">
          {profile.username}
        </h1>
        <Avatar src={profile.avatarUrl} name={displayName} size="small" />
      </header>

      <div className="mx-auto w-full max-w-[812px] space-y-4 px-3 pt-4 sm:px-0 sm:pt-8">
        <section className="rounded-2xl border border-white/[0.06] bg-[#17151d] p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex min-w-0 items-center gap-4 sm:items-start">
              <Avatar src={profile.avatarUrl} name={displayName} />
              <div className="min-w-0 flex-1 sm:hidden">
                <h2 className="break-words text-lg font-bold leading-tight">
                  {displayName}
                </h2>
                <p className="mt-1 break-words text-sm text-white/50">
                  @{profile.username}
                </p>
              </div>
              <div className="hidden sm:block">
                <h2 className="break-words text-xl font-bold">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm text-white/50">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-3 max-w-[460px] whitespace-pre-wrap break-words text-sm leading-6 text-white/75">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              {profile.isMe ? (
                <>
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <EditProfileForm profile={profile} />
                  </div>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Bagikan profil"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/75 transition hover:bg-white/5"
                  >
                    <ShareIcon />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleFollowToggle}
                    disabled={isFollowPending}
                    className={`min-h-10 flex-1 rounded-xl px-5 text-sm font-semibold transition disabled:opacity-50 sm:flex-none ${
                      profile.isFollowing
                        ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
                        : 'bg-purple-600 text-white hover:bg-purple-500'
                    }`}
                  >
                    {isFollowPending ? 'Memproses...' : profile.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Bagikan profil"
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/75 transition hover:bg-white/5"
                  >
                    <ShareIcon />
                  </button>
                </>
              )}
            </div>

            {profile.bio && (
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-white/75 sm:hidden">
                {profile.bio}
              </p>
            )}
          </div>

          {(followMutation.isError || unfollowMutation.isError) && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              Gagal memperbarui status Follow. Silakan coba lagi.
            </p>
          )}

          <div className="mt-5 grid grid-cols-4 border-t border-white/10 pt-4 sm:mt-6 sm:pt-5">
            {[
              { label: 'Post', value: profile.counts.post },
              { label: 'Followers', value: profile.counts.followers },
              { label: 'Following', value: profile.counts.following },
              { label: 'Likes', value: profile.counts.likes },
            ].map((item, index) => (
              <div key={item.label} className={`px-1 text-center ${index > 0 ? 'border-l border-white/10' : ''}`}>
                <p className="text-lg font-bold tabular-nums sm:text-xl">{item.value}</p>
                <p className="mt-1 text-[11px] text-white/50 sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              aria-pressed={activeTab === 'gallery'}
              className={`flex h-12 items-center justify-center gap-2 border-b-2 text-sm transition ${
                activeTab === 'gallery'
                  ? 'border-white font-semibold text-white'
                  : 'border-transparent text-white/50 hover:text-white/75'
              }`}
            >
              <GalleryIcon />
              Gallery
            </button>

            {profile.isMe ? (
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                aria-pressed={activeTab === 'saved'}
                className={`flex h-12 items-center justify-center gap-2 border-b-2 text-sm transition ${
                  activeTab === 'saved'
                    ? 'border-white font-semibold text-white'
                    : 'border-transparent text-white/50 hover:text-white/75'
                }`}
              >
                <BookmarkIcon />
                Saved
              </button>
            ) : (
              <div
                aria-hidden="true"
                className="border-b-2 border-transparent"
              />
            )}
          </div>

          {isContentPending && (
            <div className="py-12 text-center text-sm text-white/50">
              Memuat {activeTab === 'gallery' ? 'postingan' : 'postingan tersimpan'}...
            </div>
          )}

          {isContentError && (
            <div className="py-10 text-center">
              <p className="text-sm text-red-400">
                Gagal memuat {activeTab === 'gallery' ? 'postingan' : 'postingan tersimpan'}.
              </p>
              <button
                type="button"
                onClick={() => activeTab === 'gallery' ? postsQuery.refetch() : savedQuery.refetch()}
                className="mt-3 rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
              >
                Coba lagi
              </button>
            </div>
          )}

          {!isContentPending && !isContentError && !hasContent && (
            <div className="px-4 py-16 text-center sm:py-20">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <GalleryIcon />
              </div>
              <h3 className="mt-5 text-xl font-bold sm:text-2xl">
                {activeTab === 'gallery' && profile.isMe
                  ? 'Your story starts here'
                  : activeTab === 'saved'
                    ? 'No saved posts yet'
                    : 'Belum ada postingan'}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
                {activeTab === 'gallery' && profile.isMe
                  ? 'Share your first post and let the world see your moments, passions, and memories. Make this space truly yours.'
                  : activeTab === 'saved'
                    ? 'Postingan yang kamu simpan akan muncul di sini.'
                    : 'Postingan pengguna ini akan muncul di sini.'}
              </p>
              {activeTab === 'gallery' && profile.isMe && (
                <Link
                  href="/create-post"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                  Upload My First Post
                </Link>
              )}
            </div>
          )}

          {!isContentPending && !isContentError && hasContent && (
            <div className="grid grid-cols-3 gap-1.5 pt-3 sm:gap-2">
              {activeTab === 'gallery'
                ? posts.map((post) => (
                    <PostTile
                      key={post.id}
                      post={post}
                      username={profile.username}
                      onClick={() => {
                        setSelectedPost(post);
                        setSelectedSavedPostId(null);
                      }}
                    />
                  ))
                : savedPosts.map((post) => (
                    <PostTile
                      key={post.id}
                      post={post}
                      username={profile.username}
                      onClick={() => {
                        setSelectedPost(null);
                        setSelectedSavedPostId(post.id);
                      }}
                    />
                  ))}
            </div>
          )}
        </section>
      </div>

      {selectedSavedPostId !== null && postDetailQuery.isPending && (
        <div
          role="status"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-4 text-sm text-white"
        >
          Memuat detail postingan...
        </div>
      )}

      {selectedSavedPostId !== null && postDetailQuery.isError && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-4">
          <div
            role="alert"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#211e29] p-6 text-center text-white"
          >
            <p className="text-sm text-white/80">
              Detail postingan tidak dapat dimuat.
            </p>
            <button
              type="button"
              onClick={() => setSelectedSavedPostId(null)}
              className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {(selectedPost ||
        (selectedSavedPostId !== null &&
          postDetailQuery.data?.id === selectedSavedPostId)) && (
        <PostCommentsModal
          post={selectedPost ?? postDetailQuery.data!}
          onClose={() => {
            setSelectedPost(null);
            setSelectedSavedPostId(null);
          }}
        />
      )}
      <div className="sm:hidden">
        <ProfileBottomNav active="profile" />
      </div>
    </main>
  );
}
