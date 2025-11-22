import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    console.error("[v0] Failed to fetch:", res.status, res.statusText)
    const errorData = await res.json()
    console.error("[v0] Error details:", errorData)
    throw new Error(`Failed to fetch projects: ${res.status}`)
  }
  return res.json()
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR("/api/projects", fetcher)

  return {
    projects: Array.isArray(data) ? data : [],
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  }
}

export function useProject(id: string | number) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/projects/${id}` : null, fetcher)

  return {
    project: data,
    isLoading,
    error: error?.message,
    isError: !!error,
    mutate,
  }
}
