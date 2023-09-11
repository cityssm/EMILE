/**
 * deletedFilesProcessor
 * - Ensures files in the imported folder have corresponding records in the EnergyDataFiles table.
 * - Deletes files with no records.
 * - Deletes empty folders.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'

import { getEnergyDataFiles } from '../database/getEnergyDataFiles.js'
import { importedFolderRoot } from '../helpers/functions.files.js'

const debug = Debug('emile:tasks:deletedFilesProcessor')

/*
 * Task
 */

let terminateTask = false

async function deleteUnrecordedFiles(): Promise<void> {
  // Process

  const dateFolders = await fs.readdir(importedFolderRoot, {
    withFileTypes: true
  })

  for (const dateFolder of dateFolders) {
    if (terminateTask) {
      break
    }

    if (dateFolder.isFile()) {
      continue
    }

    const systemFolderPath = path.join(importedFolderRoot, dateFolder.name)

    const systemFileNames = await fs.readdir(systemFolderPath)

    if (systemFileNames.length === 0) {
      debug(`Delete empty folder: ${systemFolderPath}`)

      try {
        await fs.rmdir(systemFolderPath)
      } catch (error) {
        debug(`Error deleting folder: ${systemFolderPath}`)
        debug(error)
      }

      continue
    }

    const trackedFiles = getEnergyDataFiles(
      {
        systemFolderPath
      },
      {
        includeSystemFileAndFolder: true,
        includeAssetDetails: false,
        includeDeletedRecords: true,
        limit: -1
      }
    )

    for (const systemFileName of systemFileNames) {
      const recordExists = trackedFiles.some((trackedFile) => {
        return trackedFile.systemFileName === systemFileName
      })

      if (recordExists) {
        debug(`Keep file: ${systemFileName}`)
        continue
      }

      debug(`Delete file: ${systemFileName}`)

      try {
        await fs.unlink(path.join(systemFolderPath, systemFileName))
      } catch (error) {
        debug(`Error deleting file: ${systemFileName}`)
        debug(error)
      }
    }
  }
}

/*
 * Run the task
 */

await deleteUnrecordedFiles().catch((error) => {
  debug('Error running task.')
  debug(error)
})

const intervalID = setIntervalAsync(deleteUnrecordedFiles, 2 * 86_400 * 1000)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})
