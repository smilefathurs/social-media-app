"use client";

import { useMutation } from "@tanstack/react-query";
import { loginUser } from "./auth.service";
import { saveAuthSession } from "./auth-storage";
import { setCredentials } from "./auth.slice";
import { useAppDispatch } from "@/lib/redux/hooks";

export function useLoginMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: (response) => {
      if (!response.success) {
        return;
      }

      const session = {
        token: response.data.token,
        user: response.data.user,
      };

      saveAuthSession(session);
      dispatch(setCredentials(session));
    },
  });
}
