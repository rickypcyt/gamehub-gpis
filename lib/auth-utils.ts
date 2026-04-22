import { auth } from "@/auth";
import { UserRole } from "@/lib/neon";

/**
 * Check if the current session has any of the specified roles
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns The session if authorized, null otherwise
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }

  const userRole = session.user.role;
  
  if (!allowedRoles.includes(userRole)) {
    return null;
  }

  return session;
}

/**
 * Check if the current session has at least the minimum required role
 * Role hierarchy: admin > redactor > colaborador > suscriptor
 * @param minRole - Minimum role required
 * @returns The session if authorized, null otherwise
 */
export async function requireMinRole(minRole: UserRole) {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }

  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    redactor: 3,
    colaborador: 2,
    suscriptor: 1,
  };

  const userRole = session.user.role;
  
  if (roleHierarchy[userRole] < roleHierarchy[minRole]) {
    return null;
  }

  return session;
}

/**
 * Get the current session (returns null if not authenticated)
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if user has admin role
 */
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

/**
 * Check if user can create/edit news (admin or redactor)
 */
export async function canManageNews() {
  const session = await auth();
  const role = session?.user?.role;
  return role === "admin" || role === "redactor";
}

/**
 * Check if user can create blog posts (admin, redactor, or colaborador)
 */
export async function canCreateBlogPosts() {
  const session = await auth();
  const role = session?.user?.role;
  return role === "admin" || role === "redactor" || role === "colaborador";
}

/**
 * Check if user can comment (all authenticated users)
 */
export async function canComment() {
  return await isAuthenticated();
}
