import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR("/api/projects", fetcher)

  return {
    projects: data || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useProject(id: string | number) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/projects/${id}` : null, fetcher)

  return {
    project: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}
