import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import type {
  Task,
  TaskFilters,
  ApiResponse,
  TaskFormData,
  Sprint,
  SprintFilters,
  SprintFormData,
  SprintStatus,
} from "@/types/pm";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    console.error("[PM] Failed to fetch:", res.status, res.statusText);
    const errorData = await res.json();
    console.error("[PM] Error details:", errorData);
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
};

/**
 * Hook to fetch filtered list of tasks with pagination
 * @param projectId - Project ID to filter by (required)
 * @param filters - Optional filters (status, type, priority, assignee, search, etc.)
 * @returns Task list with pagination metadata
 */
export function useTasks(projectId: string, filters?: TaskFilters) {
  const params = new URLSearchParams();
  params.append("projectId", projectId);

  if (filters?.sprintId !== undefined) {
    params.append("sprintId", filters.sprintId || "null");
  }
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append("status", s));
    } else {
      params.append("status", filters.status);
    }
  }
  if (filters?.type) {
    if (Array.isArray(filters.type)) {
      filters.type.forEach((t) => params.append("type", t));
    } else {
      params.append("type", filters.type);
    }
  }
  if (filters?.priority) {
    if (Array.isArray(filters.priority)) {
      filters.priority.forEach((p) => params.append("priority", p));
    } else {
      params.append("priority", filters.priority);
    }
  }
  if (filters?.assigneeId !== undefined) {
    params.append("assigneeId", filters.assigneeId || "null");
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.parentId !== undefined) {
    params.append("parentId", filters.parentId || "null");
  }
  if (filters?.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => params.append("tags", tag));
  }

  const url = `/api/pm/tasks?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Task[]>>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    tasks: data?.data || [],
    total: data?.meta?.total || 0,
    page: data?.meta?.page || 1,
    pageSize: data?.meta?.pageSize || 50,
    totalPages: data?.meta?.totalPages || 0,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch a single task by ID
 * @param taskId - Task ID
 * @returns Single task data
 */
export function useTask(taskId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Task>>(
    taskId ? `/api/pm/tasks/${taskId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    task: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to create a new task
 * @returns Mutation function with auto-revalidation
 */
export function useCreateTask() {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    "/api/pm/tasks",
    async (url, { arg }: { arg: Partial<TaskFormData> }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Create task error:", errorData);
        throw new Error(errorData.error?.message || "Failed to create task");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all task caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/tasks")
        );
      },
    }
  );
}

/**
 * Hook to update an existing task (full update)
 * @param taskId - Task ID to update
 * @returns Mutation function with optimistic updates
 */
export function useUpdateTask(taskId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    taskId ? `/api/pm/tasks/${taskId}` : null,
    async (url, { arg }: { arg: Partial<TaskFormData> }) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Update task error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update task");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all task caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/tasks")
        );
      },
    }
  );
}

/**
 * Hook to partially update a task (for quick status/sprint changes)
 * @param taskId - Task ID to update
 * @returns Mutation function with optimistic updates
 */
export function usePatchTask(taskId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    taskId ? `/api/pm/tasks/${taskId}` : null,
    async (url, { arg }: { arg: Partial<TaskFormData> }) => {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Patch task error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update task");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all task caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/tasks")
        );
      },
    }
  );
}

/**
 * Hook to partially update any task (dynamic taskId)
 * Useful for batch operations like kanban board drag-and-drop
 * @returns Mutation function that accepts taskId and updates
 */
export function usePatchAnyTask() {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    "/api/pm/tasks/patch-any",
    async (
      _,
      { arg }: { arg: { taskId: string; updates: Partial<TaskFormData> } }
    ) => {
      const res = await fetch(`/api/pm/tasks/${arg.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg.updates),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          // If response is not JSON, get text
          const text = await res.text();
          console.error("[PM] Patch task error (non-JSON response):", {
            status: res.status,
            statusText: res.statusText,
            body: text,
          });
          throw new Error(
            `Failed to update task: ${res.status} ${res.statusText}`
          );
        }

        console.error("[PM] Patch task error:", {
          status: res.status,
          data: errorData,
          updates: arg.updates,
        });

        throw new Error(
          errorData.error?.message || errorData.message || "Invalid task data"
        );
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all task caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/tasks")
        );
      },
    }
  );
}

/**
 * Hook to delete (archive) a task
 * @param taskId - Task ID to delete
 * @returns Mutation function
 */
export function useDeleteTask(taskId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    taskId ? `/api/pm/tasks/${taskId}` : null,
    async (url) => {
      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Delete task error:", errorData);
        throw new Error(errorData.error?.message || "Failed to delete task");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all task caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/tasks")
        );
      },
    }
  );
}

// ============================================================================
// SPRINT HOOKS
// ============================================================================

/**
 * Hook to fetch filtered list of sprints
 * @param projectId - Project ID to filter by (required)
 * @param status - Optional status filter
 * @returns Sprint list
 */
export function useSprints(
  projectId: string,
  status?: SprintStatus | SprintStatus[]
) {
  const params = new URLSearchParams();
  params.append("projectId", projectId);

  if (status) {
    if (Array.isArray(status)) {
      status.forEach((s) => params.append("status", s));
    } else {
      params.append("status", status);
    }
  }

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Sprint[]>>(
    `/api/pm/sprints?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    sprints: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch a single sprint by ID
 * @param sprintId - Sprint ID
 * @returns Single sprint data
 */
export function useSprint(sprintId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Sprint>>(
    sprintId ? `/api/pm/sprints/${sprintId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    sprint: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to get the currently active sprint for a project
 * @param projectId - Project ID
 * @returns Active sprint data
 */
export function useActiveSprint(projectId: string) {
  const { sprints, isLoading, error, isError, mutate } = useSprints(
    projectId,
    "active"
  );

  return {
    sprint: sprints[0] || null,
    isLoading,
    error,
    isError,
    mutate,
  };
}

/**
 * Hook to create a new sprint
 * @returns Mutation function with auto-revalidation
 */
export function useCreateSprint() {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    "/api/pm/sprints",
    async (url, { arg }: { arg: Partial<SprintFormData> }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Create sprint error:", errorData);
        throw new Error(errorData.error?.message || "Failed to create sprint");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all sprint caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/sprints")
        );
      },
    }
  );
}

/**
 * Hook to update an existing sprint (full update)
 * @param sprintId - Sprint ID to update
 * @returns Mutation function with optimistic updates
 */
export function useUpdateSprint(sprintId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    sprintId ? `/api/pm/sprints/${sprintId}` : null,
    async (url, { arg }: { arg: Partial<SprintFormData> }) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Update sprint error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update sprint");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all sprint and task caches (tasks may be affected)
        mutate(
          (key) =>
            typeof key === "string" &&
            (key.startsWith("/api/pm/sprints") ||
              key.startsWith("/api/pm/tasks"))
        );
      },
    }
  );
}

/**
 * Hook to partially update a sprint (for quick status changes)
 * @param sprintId - Sprint ID to update
 * @returns Mutation function with optimistic updates
 */
export function usePatchSprint(sprintId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    sprintId ? `/api/pm/sprints/${sprintId}` : null,
    async (url, { arg }: { arg: Partial<SprintFormData> }) => {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Patch sprint error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update sprint");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all sprint caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/sprints")
        );
      },
    }
  );
}

/**
 * Hook to delete a sprint
 * @param sprintId - Sprint ID to delete
 * @returns Mutation function
 */
export function useDeleteSprint(sprintId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    sprintId ? `/api/pm/sprints/${sprintId}` : null,
    async (url) => {
      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Delete sprint error:", errorData);
        throw new Error(errorData.error?.message || "Failed to delete sprint");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all sprint and task caches (tasks will be unassigned)
        mutate(
          (key) =>
            typeof key === "string" &&
            (key.startsWith("/api/pm/sprints") ||
              key.startsWith("/api/pm/tasks"))
        );
      },
    }
  );
}

/**
 * Hook to get all tasks in a sprint
 * @param sprintId - Sprint ID
 * @returns Tasks in the sprint
 */
export function useSprintTasks(sprintId: string | null) {
  const params = new URLSearchParams();
  if (sprintId) {
    params.append("sprintId", sprintId);
  }

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Task[]>>(
    sprintId ? `/api/pm/tasks?${params.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    tasks: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

// ============================================================================
// TAG HOOKS
// ============================================================================

/**
 * Hook to fetch all tags for a project
 * @param projectId - Project ID
 * @returns Tag list
 */
export function useTags(projectId: string | null) {
  const params = new URLSearchParams();
  if (projectId) {
    params.append("projectId", projectId);
  }

  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<import("@/types/pm").Tag[]>
  >(projectId ? `/api/pm/tags?${params.toString()}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    tags: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch a single tag by ID
 * @param tagId - Tag ID
 * @returns Single tag data
 */
export function useTag(tagId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<import("@/types/pm").Tag>
  >(tagId ? `/api/pm/tags/${tagId}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    tag: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to create a new tag
 * @returns Mutation function with auto-revalidation
 */
export function useCreateTag() {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    "/api/pm/tags",
    async (url, { arg }: { arg: import("@/types/pm").TagFormData }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Create tag error:", errorData);
        throw new Error(errorData.error?.message || "Failed to create tag");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all tag caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/tags")
        );
      },
    }
  );
}

/**
 * Hook to update an existing tag
 * @param tagId - Tag ID to update
 * @returns Mutation function with optimistic updates
 */
export function useUpdateTag(tagId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    tagId ? `/api/pm/tags/${tagId}` : null,
    async (
      url,
      { arg }: { arg: Partial<import("@/types/pm").TagFormData> }
    ) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Update tag error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update tag");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all tag and task caches (tasks may reference tags)
        mutate(
          (key) =>
            typeof key === "string" &&
            (key.startsWith("/api/pm/tags") || key.startsWith("/api/pm/tasks"))
        );
      },
    }
  );
}

/**
 * Hook to delete a tag
 * @param tagId - Tag ID to delete
 * @returns Mutation function
 */
export function useDeleteTag(tagId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    tagId ? `/api/pm/tags/${tagId}` : null,
    async (url) => {
      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Delete tag error:", errorData);
        throw new Error(errorData.error?.message || "Failed to delete tag");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all tag and task caches (tasks will have tag removed)
        mutate(
          (key) =>
            typeof key === "string" &&
            (key.startsWith("/api/pm/tags") || key.startsWith("/api/pm/tasks"))
        );
      },
    }
  );
}

// ============================================================================
// USER HOOKS
// ============================================================================

/**
 * Hook to fetch all users with optional filters
 * @param filters - Optional filters (role, isActive)
 * @returns User list
 */
export function useUsers(filters?: { role?: string; isActive?: boolean }) {
  const params = new URLSearchParams();

  if (filters?.role) {
    params.append("role", filters.role);
  }
  if (filters?.isActive !== undefined) {
    params.append("isActive", String(filters.isActive));
  }

  const { data, error, isLoading, mutate} = useSWR<
    ApiResponse<import("@/types/pm").User[]>
  >(`/api/users?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    users: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch a single user by ID
 * @param userId - User ID
 * @returns Single user data
 */
export function useUser(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<import("@/types/pm").User>
  >(userId ? `/api/pm/users/${userId}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  return {
    user: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to create a new user (placeholder user)
 * @returns Mutation function with auto-revalidation
 */
export function useCreateUser() {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    "/api/pm/users",
    async (url, { arg }: { arg: import("@/types/pm").UserFormData }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Create user error:", errorData);
        throw new Error(errorData.error?.message || "Failed to create user");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all user caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/users")
        );
      },
    }
  );
}

/**
 * Hook to update an existing user (full update)
 * @param userId - User ID to update
 * @returns Mutation function with optimistic updates
 */
export function useUpdateUser(userId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    userId ? `/api/pm/users/${userId}` : null,
    async (
      url,
      { arg }: { arg: Partial<import("@/types/pm").UserFormData> }
    ) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Update user error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update user");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all user and task caches (tasks may reference users)
        mutate(
          (key) =>
            typeof key === "string" &&
            (key.startsWith("/api/pm/users") || key.startsWith("/api/pm/tasks"))
        );
      },
    }
  );
}

/**
 * Hook to partially update a user (e.g., deactivate)
 * @param userId - User ID to update
 * @returns Mutation function with optimistic updates
 */
export function usePatchUser(userId: string | null) {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    userId ? `/api/pm/users/${userId}` : null,
    async (
      url,
      { arg }: { arg: Partial<import("@/types/pm").UserFormData> }
    ) => {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("[PM] Patch user error:", errorData);
        throw new Error(errorData.error?.message || "Failed to update user");
      }

      return res.json();
    },
    {
      onSuccess: () => {
        // Invalidate all user caches
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/pm/users")
        );
      },
    }
  );
}

// ============================================================================
// METRICS HOOKS
// ============================================================================

/**
 * Hook to fetch velocity data for recent sprints
 * @param projectId - Project ID
 * @param sprintCount - Number of recent sprints to fetch (default: 6)
 * @returns Velocity data with average
 */
export function useVelocity(projectId: string, sprintCount: number = 6) {
  const params = new URLSearchParams();
  params.append("projectId", projectId);
  params.append("sprintCount", String(sprintCount));

  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<{
      velocityData: import("@/types/pm").VelocityData[];
      averageVelocity: number;
      sprintCount: number;
    }>
  >(`/api/pm/metrics/velocity?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Auto-refresh every 30s
  });

  return {
    velocityData: data?.data?.velocityData || [],
    averageVelocity: data?.data?.averageVelocity || 0,
    sprintCount: data?.data?.sprintCount || 0,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch burndown chart data for a sprint
 * @param sprintId - Sprint ID (null = no data)
 * @returns Burndown chart data
 */
export function useBurndown(sprintId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<import("@/types/pm").BurndownData>
  >(
    sprintId ? `/api/pm/metrics/burndown?sprintId=${sprintId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Auto-refresh every 30s
    }
  );

  return {
    burndownData: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch sprint summary metrics
 * @param sprintId - Sprint ID (null = no data)
 * @returns Sprint summary with KPIs
 */
export function useSprintSummary(sprintId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<import("@/types/pm").SprintSummary>
  >(sprintId ? `/api/pm/metrics/summary?sprintId=${sprintId}` : null, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Auto-refresh every 30s
  });

  console.log("data", data);

  return {
    summary: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}

/**
 * Hook to fetch project-level metrics
 * @param projectId - Project ID
 * @returns Project summary metrics
 */
export function useProjectSummary(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR<
    ApiResponse<import("@/types/pm").ProjectSummary>
  >(`/api/pm/metrics/summary?projectId=${projectId}`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // Auto-refresh every 30s
  });

  return {
    summary: data?.data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  };
}
