"use client";

import Link from "next/link";
import { useAppSelector } from "@/lib/redux/hooks";
import { useFeedQuery } from "@/features/posts/posts.hooks";
import PostCard from "@/features/posts/components/PostCard";
import UserSearch from "@/features/users/components/UserSearch";

export default function Home() {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );

  const feedQuery = useFeedQuery({ page: 1, limit: 20 }, isAuthenticated);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-600">
            Sociality
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-blue-600">Home</Link>
            {isAuthenticated ? (
              <span className="max-w-36 truncate">
                {user?.name ?? user?.username}
              </span>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Menu
            </p>
            <div className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Home Feed
            </div>
            <div className="rounded-lg px-3 py-2 text-gray-500">Explore</div>
            <div className="rounded-lg px-3 py-2 text-gray-500">Saved Posts</div>
            <div className="rounded-lg px-3 py-2 text-gray-500">Profile</div>
          </div>
        </aside>

        <section className="mx-auto w-full max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Home Feed</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Temukan cerita dan kabar terbaru dari komunitasmu.
            </p>
          </div>

          {isAuthenticated && <UserSearch />}

          {!isAuthenticated && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="font-semibold">Selamat datang di Sociality!</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Login untuk melihat feed dan berinteraksi dengan komunitas.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Login sekarang
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="font-semibold">Apa yang sedang kamu pikirkan?</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Fitur membuat postingan akan kita integrasikan berikutnya.
                </p>
              </div>

              {feedQuery.isPending && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900">
                  Memuat feed...
                </div>
              )}

              {feedQuery.isError && (
                <div className="rounded-xl border border-red-200 bg-white p-5 dark:border-red-900 dark:bg-gray-900">
                  <p className="font-semibold text-red-600">
                    Feed gagal dimuat.
                  </p>
                  <p className="mt-1 break-words text-sm text-gray-500">
                    {feedQuery.error instanceof Error
                      ? feedQuery.error.message
                      : "Terjadi kesalahan."}
                  </p>
                  <button
                    type="button"
                    onClick={() => feedQuery.refetch()}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {feedQuery.isSuccess && feedQuery.data.data.items.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
                  <h2 className="font-semibold">Belum ada postingan</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Postingan dari komunitasmu akan muncul di sini.
                  </p>
                </div>
              )}

              {feedQuery.isSuccess && feedQuery.data.data.items.length > 0 && (
                <div className="space-y-5">
                  {feedQuery.data.data.items.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}


