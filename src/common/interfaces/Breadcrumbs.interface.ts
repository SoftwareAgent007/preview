export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsNavigationProps {
  items: BreadcrumbItem[];
}