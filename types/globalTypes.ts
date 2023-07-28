export interface Emile {
  urlPrefix: string
  canUpdate: boolean

  getMapLink: (latitude: number, longitude: number) => string

  setUnsavedChanges: () => void
  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
}
