export interface User {
  id: number;
  username: string;
  roles: string[]; // e.g., ['admin', 'editor']
  permissions: string[]; // e.g., ['edit-posts', 'delete-posts']
}
