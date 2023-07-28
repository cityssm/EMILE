import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'

const debug = Debug('emile:tasks:uploadedFilesProcessor')

let terminateTask = false

let isProcessing = false
let processAgainOnComplete = false

async function processUploadedFiles(): Promise<void> {
  if (isProcessing) {
    debug('Already running')
    processAgainOnComplete = true
    return
  }

  isProcessing = true
  processAgainOnComplete = false

  // Process

  isProcessing = false

  if (processAgainOnComplete) {
    processAgainOnComplete = false
    await processUploadedFiles()
  }
}

await processUploadedFiles().catch(() => {
  debug('Error running task.')
})

const intervalID = setIntervalAsync(processUploadedFiles, 6 * 3600 * 1000)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})
