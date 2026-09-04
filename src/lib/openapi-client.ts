// import {
//   Configuration,
//   DashboardApi,
// } from '@jacliner/fleet-inventory-api-ts-client'

// import { env } from '@/config/env'
// import {
//   keycloak,
//   logoutToLogin,
//   UPDATE_TOKEN_MIN_VALIDITY_SEC,
// } from '@/lib/keycloak'

// export const configuration = new Configuration({
//   basePath: env.API_URL,
//   accessToken: async (): Promise<string> => {
//     try {
//       await keycloak.updateToken(UPDATE_TOKEN_MIN_VALIDITY_SEC)
//     } catch {
//       await logoutToLogin(keycloak)
//       return ''
//     }

//     if (!keycloak.token) {
//       await logoutToLogin(keycloak)
//       return ''
//     }

//     return keycloak.token
//   },
// })

// export const dashboardApi = new DashboardApi(configuration)
