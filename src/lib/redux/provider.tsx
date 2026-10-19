"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import type { AppStore } from "./store";
import { makeStore } from "./store";
import { setAuthTokenGetter } from "@/lib/api";
import { loadAuthSession } from "@/features/auth/auth-storage";
import { restoreSession } from "@/features/auth/auth.slice";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<AppStore | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const currentStore = makeStore();

    setAuthTokenGetter(() => currentStore.getState().auth.token);

    const session = loadAuthSession();

    if (session) {
      currentStore.dispatch(
        restoreSession({
          token: session.token,
          user: session.user,
        }),
      );
    }

    setStore(currentStore);
    setIsSessionReady(true);
  }, []);

  if (!store || !isSessionReady) {
    return null;
  }

  return <Provider store={store}>{children}</Provider>;
}
