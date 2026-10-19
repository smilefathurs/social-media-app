"use client";

import { useState, type FormEvent } from "react";
import {
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  usePostCommentsQuery,
} from "../posts.hooks";

interface PostCommentsProps {
  postId: number;
}

function formatCommentDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function PostComments({ postId }: PostCommentsProps) {
  const [text, setText] = useState("");
  const commentsQuery = usePostCommentsQuery(postId);
  const addMutation = useAddPostCommentMutation(postId);
  const deleteMutation = useDeletePostCommentMutation(postId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();
    if (!trimmedText || addMutation.isPending) return;

    addMutation.mutate(trimmedText, {
      onSuccess: () => setText(""),
    });
  }

  const comments = commentsQuery.data?.data.comments ?? [];

  return (
    <section className="border-t border-gray-100 px-4 py-4 dark:border-gray-800">
      <h3 className="mb-3 text-sm font-semibold">Komentar</h3>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Tulis komentar..."
          aria-label="Tulis komentar"
          maxLength={1000}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={!text.trim() || addMutation.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addMutation.isPending ? "Mengirim..." : "Kirim"}
        </button>
      </form>

      {addMutation.isError && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          Komentar gagal dikirim. Silakan coba lagi.
        </p>
      )}

      {commentsQuery.isLoading && (
        <p className="text-sm text-gray-500">Memuat komentar...</p>
      )}

      {commentsQuery.isError && (
        <p role="alert" className="text-sm text-red-600">
          Komentar gagal dimuat.
          <button
            type="button"
            onClick={() => commentsQuery.refetch()}
            className="ml-2 underline"
          >
            Coba lagi
          </button>
        </p>
      )}

      {!commentsQuery.isLoading &&
        !commentsQuery.isError &&
        comments.length === 0 && (
          <p className="text-sm text-gray-500">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </p>
        )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {(comment.author?.name || comment.author?.username || "?")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-sm font-semibold">
                  {comment.author?.name || comment.author?.username || "Pengguna"}
                </p>
                <time className="text-xs text-gray-500" dateTime={comment.createdAt}>
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>

              <p className="mt-1 whitespace-pre-wrap break-words text-sm">
                {comment.text}
              </p>

              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm("Hapus komentar ini?")) {
                    deleteMutation.mutate(comment.id);
                  }
                }}
                className="mt-1 text-xs text-gray-500 underline hover:text-red-600 disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </article>
        ))}
      </div>

      {deleteMutation.isError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          Komentar tidak dapat dihapus. Pastikan kamu pemilik komentar atau postingan.
        </p>
      )}
    </section>
  );
}

