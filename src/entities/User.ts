export type UserRoles = "ADMIN" | "MEMBER";

export type User = {
  id?: string;
  name: string;
  email: string;
  role: UserRoles;
  password: string;
  created_at: Date;
};
