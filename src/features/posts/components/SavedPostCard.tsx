'use client';

import PostCard from './PostCard';
import { usePostDetailQuery } from '../posts.hooks';
import type { SavedPost } from '../posts.types';

export default function SavedPostCard({ post }: { post: SavedPost }) {
  const detailQuery = usePostDetailQuery(post.id);

  if (detailQuery.isPending) {
    return (
      <div className="animate-pulse rounded-2xl border border-white/10 bg-[#111014] p-5">
        <div className="h-10 w-40 rounded-lg bg-white/10" />
        <div className="mt-4 aspect-square rounded-xl bg-white/5" />
        <div className="mt-4 h-4 w-3/4 rounded bg-white/10" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111014] p-5">
        <p className="text-sm text-white/60">
          Gagal memuat detail postingan ini.
        </p>
        <button
          type="button"
          onClick={() => detailQuery.refetch()}
          className="mt-3 cursor-pointer rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <PostCard
      post={detailQuery.data}
      metadataLabel="Saved to your collection"
    />
  );
}
