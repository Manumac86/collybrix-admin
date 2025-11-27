import { LayoutWrapper } from "@/components/layout-wrapper";

/**
 * Root layout for Project Management section
 * Wraps all PM pages with consistent sidebar navigation
 */
export default function ProjectManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
