export interface Emile {
  urlPrefix: string
  canUpdate: boolean

  setUnsavedChanges: () => void
  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean
}
