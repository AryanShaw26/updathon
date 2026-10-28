import type { UpdathonApi } from '../../shared/types'

declare global {
  interface Window {
    updathon: UpdathonApi
  }
}

export {}
