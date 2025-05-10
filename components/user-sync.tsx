"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    syncUser({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      imageUrl: user.imageUrl,
      lastSignInAt: Date.now(),
      createdAt: user.createdAt
        ? new Date(user.createdAt).getTime()
        : new Date().getTime(),
    });
  }, [isLoaded, user, syncUser]);

  return null;
}
