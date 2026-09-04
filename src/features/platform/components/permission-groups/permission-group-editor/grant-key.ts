export function grantKey(roleId: number, permissionId: number): string {
  return `${roleId}:${permissionId}`
}
