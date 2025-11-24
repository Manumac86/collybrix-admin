import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type { Estimation } from "@/types/estimation";

const fetcher = async (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
) => {
  const res = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    console.error("[v0] Failed to fetch:", res.status, res.statusText);
    const errorData = await res.json();
    console.error("[v0] Error details:", errorData);
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
};

export function useEstimations() {
  const { data, error, isLoading, mutate } = useSWR<Estimation[]>(
    "/api/estimations",
    fetcher
  );

  return {
    estimations: Array.isArray(data) ? data : [],
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

export function useEstimation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Estimation>(
    id ? `/api/estimations/${id}` : null,
    fetcher
  );

  return {
    estimation: data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

export function useCreateEstimation() {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    "/api/estimations",
    async (url: string, { arg }: { arg: Partial<Estimation> }) => {
      const res = await fetcher(url, "POST", arg);
      return res;
    },
    {
      onSuccess: () => {
        mutate("/api/estimations");
      },
    }
  );
}

export function useUpdateEstimation(id: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    id ? `/api/estimations/${id}` : null,
    async (url: string, { arg }: { arg: Partial<Estimation> }) => {
      const res = await fetcher(url, "PUT", arg);
      return res;
    },
    {
      onSuccess: () => {
        mutate("/api/estimations");
        if (id) mutate(`/api/estimations/${id}`);
      },
    }
  );
}

export function useDeleteEstimation(id: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    id ? `/api/estimations/${id}` : null,
    async (url: string) => {
      const res = await fetcher(url, "DELETE");
      return res;
    },
    {
      onSuccess: () => {
        mutate("/api/estimations");
      },
    }
  );
}

export function useEstimationStats() {
  const { estimations, isLoading, error } = useEstimations();

  if (isLoading || error) {
    return {
      totalEstimations: 0,
      totalValue: 0,
      averageValue: 0,
      statusCounts: {
        draft: 0,
        sent: 0,
        approved: 0,
        rejected: 0,
      },
      isLoading,
      error,
    };
  }

  const totalEstimations = estimations.length;
  const totalValue = estimations.reduce((sum, est) => sum + (est.finalPrice || 0), 0);
  const averageValue = totalEstimations > 0 ? totalValue / totalEstimations : 0;

  const statusCounts = estimations.reduce(
    (acc, est) => {
      acc[est.status] = (acc[est.status] || 0) + 1;
      return acc;
    },
    { draft: 0, sent: 0, approved: 0, rejected: 0 } as Record<string, number>
  );

  return {
    totalEstimations,
    totalValue,
    averageValue,
    statusCounts,
    isLoading: false,
    error: null,
  };
}
