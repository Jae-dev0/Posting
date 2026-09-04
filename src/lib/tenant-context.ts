const ACTIVE_COMPANY_KEY = 'posting-active-company-id'

export function getActiveCompanyId(): number | null {
  const raw = localStorage.getItem(ACTIVE_COMPANY_KEY)
  if (!raw) return null
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export function setActiveCompanyId(companyId: number | null) {
  if (companyId == null) {
    localStorage.removeItem(ACTIVE_COMPANY_KEY)
    return
  }
  localStorage.setItem(ACTIVE_COMPANY_KEY, String(companyId))
}
