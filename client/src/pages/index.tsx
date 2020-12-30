import React, { useEffect } from "react";

import { useToast } from "@chakra-ui/react";

import { Dashboard } from "../components/dashboard/Dashboard";
import { LoadingPage } from "../components/Loading";
import { useUser } from "../utils/useUser";

export default function IndexPage() {
  const { loading, user } = useUser({
    requireAuth: true,
  });

  const toast = useToast();

  const hasUser = Boolean(user);

  useEffect(() => {
    if (hasUser && user) {
      setTimeout(() => {
        toast({
          status: "success",
          title: `${user.name} - ${user.email}`,
          position: "bottom-right",
          duration: 5000,
        });
      }, 500);
    }
  }, [hasUser]);

  if (loading && !hasUser) {
    return <LoadingPage />;
  }

  return <Dashboard />;
}
