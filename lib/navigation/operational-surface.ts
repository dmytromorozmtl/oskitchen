/** Dashboard, vendor, kitchen, and platform surfaces — skip marketing/analytics JS. */
export function isOperationalSurface(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/kitchen") ||
    pathname.startsWith("/platform")
  );
}
