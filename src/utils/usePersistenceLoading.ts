import constate from "constate";
import { useEffect, useState } from "react";

export const [PersistenceLoadingProvider, useIsPersistenceLoading] = constate(
  () => {
    const [isPersistenceLoading, setIsPersistenceLoading] = useState(true);
    const [isForeplanLoading, setIsForeplanLoading] = useState(true);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    useEffect(() => {
      const isLoading = isForeplanLoading || isDashboardLoading;
      if (isLoading !== isPersistenceLoading) {
        setIsPersistenceLoading(isLoading);
      }
    }, [
      isPersistenceLoading,
      isForeplanLoading,
      isDashboardLoading,
      setIsPersistenceLoading,
    ]);

    return {
      isPersistenceLoading,
      setIsForeplanLoading,
      setIsDashboardLoading,
    };
  }
);
