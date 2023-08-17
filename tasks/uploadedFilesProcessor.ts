/**
 * uploadedFilesProcessor
 * - Accepts files uploaded through the web interface, or copied to the 'uploads' folder.
 * - Validates that the file has an acceptable file extension.
 * - Move the file to a storage folder.
 * - Creates a database record for the new file.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

import chokidar from 'chokidar'
import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'

import { addEnergyDataFile } from '../database/addEnergyDataFile.js'
import {
  fileExtensions as allowedFileExtensions,
  getDefaultParserPropertiesByFileName
} from '../parsers/parserHelpers.js'

const debug = Debug('emile:tasks:uploadedFilesProcessor')

const processorUser: EmileUser = {
  userName: 'system.uploadProcessor',
  canLogin: false,
  canUpdate: true,
  isAdmin: true
}

/*
 * Settings
 */

const uploadsFolder = 'data/files/uploads'
const importedFolderRoot = 'data/files/imported'

// eslint-disable-next-line unicorn/better-regex
const timestampPrependedRegex = /^\[\d+\].+/

/*
 * Task
 */

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

  const fileNames = await fs.readdir(uploadsFolder)

  const rightNow = new Date()

  const systemFolderPath = path.join(
    importedFolderRoot,
    `${rightNow.getFullYear().toString()}-${(rightNow.getMonth() + 1).toString()}`
  )

  try {
    await fs.mkdir(systemFolderPath)
  } catch {
    // ignore, already exists
  }

  for (const fileName of fileNames) {
    if (terminateTask) {
      break
    }

    const fileNameLowerCase = fileName.toLowerCase()

    // Skip the readme.md file

    if (fileNameLowerCase === 'readme.md') {
      continue
    }

    // Check file extensions

    const fileExtension = fileNameLowerCase.slice(
      fileNameLowerCase.lastIndexOf('.') + 1
    )
    let extensionAllowed = false

    for (const allowedFileExtension of allowedFileExtensions) {
      if (allowedFileExtension === fileExtension) {
        extensionAllowed = true
        break
      }
    }

    // Move file

    let originalFileName = fileName

    if (timestampPrependedRegex.test(originalFileName)) {
      originalFileName = originalFileName.slice(
        Math.max(0, originalFileName.indexOf(']') + 1)
      )
    }

    const systemFileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${fileExtension}`

    await fs.copyFile(
      path.join(uploadsFolder, fileName),
      path.join(systemFolderPath, systemFileName)
    )

    const parserProperties =
      getDefaultParserPropertiesByFileName(originalFileName)

    addEnergyDataFile(
      {
        originalFileName,
        systemFileName,
        systemFolderPath,
        parserProperties,
        isPending: extensionAllowed,
        isFailed: !extensionAllowed,
        processedTimeMillis: extensionAllowed ? undefined : Date.now(),
        processedMessage: extensionAllowed
          ? ''
          : `File extension not allowed: ${fileExtension}`
      },
      processorUser
    )

    await fs.unlink(path.join(uploadsFolder, fileName))
  }

  isProcessing = false

  if (processAgainOnComplete) {
    processAgainOnComplete = false
    await processUploadedFiles()
  }
}

/*
 * Run the task
 */

await processUploadedFiles().catch((error) => {
  debug('Error running task.')
  debug(error)
})

const intervalID = setIntervalAsync(processUploadedFiles, 6 * 3600 * 1000)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
chokidar.watch(uploadsFolder).on('add', processUploadedFiles)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})
