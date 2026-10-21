'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Provider } from 'react-redux';
import type { AppStore } from './store';
import { makeStore } from './store';
import { loadAuthSession } from '@/features/auth/auth-storage';
import { restoreSession } from '@/features/auth/auth.slice';

function createSessionReadinessStore() {
  let isReady = false;
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot() {
      return isReady;
    },

    getServerSnapshot() {
      return false;
    },

    markReady() {
      if (isReady) return;

      isReady = true;
      listeners.forEach((listener) => listener());
    },
  };
}

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());
  const [readiness] = useState(() => createSessionReadinessStore());

  const isSessionReady = useSyncExternalStore(
    readiness.subscribe,
    readiness.getSnapshot,
    readiness.getServerSnapshot
  );

  useEffect(() => {
    const session = loadAuthSession();

    if (session) {
      store.dispatch(
        restoreSession({
          token: session.token,
          user: session.user,
        })
      );
    }

    readiness.markReady();
  }, [store, readiness]);

  if (!isSessionReady) {
    return null;
  }

  return <Provider store={store}>{children}</Provider>;
}
