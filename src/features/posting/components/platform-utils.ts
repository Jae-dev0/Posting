import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa6'

import type { SocialPlatform } from '../types'
import { SocialPlatformEnum } from '../types'

const platformConfig: Record<
  SocialPlatform,
  { label: string; icon: typeof FaFacebook; color: string }
> = {
  [SocialPlatformEnum.Facebook]: {
    label: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
  },
  [SocialPlatformEnum.Instagram]: {
    label: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
  },
  [SocialPlatformEnum.TikTok]: {
    label: 'TikTok',
    icon: FaTiktok,
    color: '#000000',
  },
}

export function getPlatformIcon(platform: SocialPlatform) {
  return platformConfig[platform].icon
}

export function getPlatformLabel(platform: SocialPlatform) {
  return platformConfig[platform].label
}

export function getPlatformColor(platform: SocialPlatform) {
  return platformConfig[platform].color
}

export function getPlatformConfig(platform: SocialPlatform) {
  return platformConfig[platform]
}

export function tryGetPlatformConfig(platform: string) {
  if (platform in platformConfig) {
    return platformConfig[platform as SocialPlatform]
  }
  return null
}
