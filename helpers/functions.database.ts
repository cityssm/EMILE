import fs from 'node:fs/promises'
import path from 'node:path'

import sqlite from 'better-sqlite3'
import Debug from 'debug'

import type { DatabaseFile } from '../types/applicationTypes.js'

import { getConfigProperty } from './functions.config.js'
import { delay } from './functions.utilities.js'

const debug = Debug('emile:functions.database')

// Determine if test databases should be used

export const useTestDatabases =
  getConfigProperty('application.useTestDatabases') ||
  process.env.TEST_DATABASES === 'true'

if (useTestDatabases) {
  debug('Using "-testing" databases.')
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const databasePath_live = 'data/emile.db'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const databasePath_testing = 'data/emile-testing.db'

export const databasePath = useTestDatabases
  ? databasePath_testing
  : databasePath_live

/*
 * Backups
 */

export const backupFolder = 'data/backups'

export async function backupDatabase(): Promise<string | false> {
  const databasePathSplit = databasePath.split(/[/\\]/)

  const backupFileName = `${Date.now().toString()}-${
    databasePathSplit.at(-1) ?? 'emile.db'
  }`

  const backupDatabasePath = path.join(backupFolder, backupFileName)

  try {
    await fs.copyFile(databasePath, backupDatabasePath)
    return backupDatabasePath
  } catch {
    return false
  }
}

export async function deleteDatabaseBackupFile(
  fileName: string
): Promise<boolean> {
  if (
    fileName.includes('/') ||
    fileName.includes('\\') ||
    fileName.includes('..')
  ) {
    return false
  }

  const backupFiles = await getBackedUpDatabaseFiles()

  const fileFound = backupFiles.some((possibleFile) => {
    return possibleFile.fileName === fileName
  })

  if (fileFound) {
    await fs.unlink(path.join(backupFolder, fileName))
    return true
  }

  return false
}

export async function getBackedUpDatabaseFiles(): Promise<DatabaseFile[]> {
  const databaseFiles: DatabaseFile[] = []

  const fileNames = await fs.readdir(backupFolder)

  for (let index = fileNames.length - 1; index >= 0; index -= 1) {
    const fileName = fileNames[index]

    const fileStats = await fs.stat(path.join(backupFolder, fileName))

    if (fileStats.isFile() && fileName.endsWith('.db')) {
      databaseFiles.push({
        fileName,
        sizeInMegabytes: fileStats.size / (1024 * 1024),
        lastModifiedTime: fileStats.mtime.toString()
      })
    }
  }

  return databaseFiles
}

export async function getConnectionWhenAvailable(
  readOnly = false
): Promise<sqlite.Database> {
  try {
    return sqlite(databasePath)
  } catch {
    debug('Waiting 1s for database connection...')
    await delay(1000)
    return await getConnectionWhenAvailable(readOnly)
  }
}
