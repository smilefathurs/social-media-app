import type { Post } from "./posts.types";

export const guestPosts: Post[] = [
  {
    id: 900001,
    imageUrl: null,
    caption:
      "Small steps every day can lead to meaningful changes. Keep showing up for yourself.",
    createdAt: "2026-10-22T08:00:00.000Z",
    author: {
      id: 9001,
      username: "daily.motivation",
      name: "Daily Motivation",
      avatarUrl: null,
    },
    likeCount: 128,
    commentCount: 12,
    likedByMe: false,
  },
  {
    id: 900002,
    imageUrl: null,
    caption:
      "Take a moment to pause, breathe, and appreciate how far you have come.",
    createdAt: "2026-10-21T10:30:00.000Z",
    author: {
      id: 9002,
      username: "mindful.space",
      name: "Mindful Space",
      avatarUrl: null,
    },
    likeCount: 86,
    commentCount: 7,
    likedByMe: false,
  },
  {
    id: 900003,
    imageUrl: null,
    caption:
      "Your journey does not need to look like anyone else's. Grow at your own pace.",
    createdAt: "2026-10-20T14:15:00.000Z",
    author: {
      id: 9003,
      username: "growth.journal",
      name: "Growth Journal",
      avatarUrl: null,
    },
    likeCount: 54,
    commentCount: 4,
    likedByMe: false,
  },
];
