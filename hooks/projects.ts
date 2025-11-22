import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
export const fetcher = async (
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body: any = undefined
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
    throw new Error(`Failed to fetch projects: ${res.status}`);
  }
  return res.json();
};

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR("/api/projects", fetcher);

  return {
    projects: Array.isArray(data) ? data : [],
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

export function useDeleteProject(id: string | null) {
  const { mutate } = useSWRConfig();
  return useSWRMutation(
    id ? `/api/projects/${id}` : null,
    async (url: string) => {
      const res = await (id
        ? fetcher(url, "DELETE", undefined)
        : (Promise.resolve({ success: true }) as Promise<{ success: true }>));
      return res;
    },
    {
      onSuccess: () => {
        mutate("/api/projects");
      },
    }
  );
}

export function useProject(id: string | number) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/projects/${id}` : null,
    fetcher
  );

  return {
    project: data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

export function useRevenue() {
  const { data, error, isLoading } = useSWR("/api/projects/revenue", fetcher);
  return {
    monthlyRevenueData: data?.monthlyRevenueData?.map(
      (item: { month: string; revenue: number }) => ({
        month: item.month,
        revenue: item.revenue,
      })
    ),
    totalRevenue: data?.totalRevenue,
    isLoading,
    error: error?.message,
    isError: !!error,
  };
}

export function useProjectPipelineStatusDistribution() {
  const { data, error, isLoading } = useSWR<{ stage: string; count: number }[]>(
    "/api/projects/pipeline",
    fetcher
  );
  return {
    projectPipelineStatusDistributionData: data?.map((item) => ({
      stage: item.stage,
      count: item.count,
    })),
    isLoading,
    error: error?.message,
  };
}
