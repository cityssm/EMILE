import fs from 'node:fs/promises'
import path from 'node:path'

import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'

import { getEnergyDataFilesToProcess } from '../database/getEnergyDataFiles.js'
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js'
import { getConnectionWhenAvailable } from '../helpers/functions.database.js'
import type { BaseParser } from '../parsers/baseParser.js'
import { GreenButtonParser } from '../parsers/greenButtonParser.js'
import { getParserClasses } from '../parsers/parserHelpers.js'
import { SheetParser } from '../parsers/sheetParser.js'
import type { RunFileProcessorWorkerMessage } from '../types/applicationTypes.js'

const debug = Debug('emile:tasks:energyDataFilesProcessor')

process.title = 'EMILE - energyDataFilesProcessor'

const processorUser: EmileUser = {
  userName: 'system.fileProcessor',
  canLogin: false,
  canUpdate: true,
  isAdmin: true
}

/*
 * Task
 */

let terminateTask = false
let isRunning = false
let runAgainOnComplete = false

async function processFiles(): Promise<void> {
  if (isRunning) {
    debug('Already running')
    runAgainOnComplete = true
    return
  }

  debug('Process started')

  isRunning = true
  runAgainOnComplete = false

  const emileDB = await getConnectionWhenAvailable()

  const dataFiles = await getEnergyDataFilesToProcess(emileDB)

  if (dataFiles.length > 0) {
    debug(`${dataFiles.length} files to process.`)
  }

  for (const dataFile of dataFiles) {
    if (terminateTask || runAgainOnComplete) {
      break
    }

    debug(`Parsing ${dataFile.originalFileName} ...`)

    /*
     * Validate file exists and can be read
     */

    const filePath = path.join(
      dataFile.systemFolderPath,
      dataFile.systemFileName
    )

    try {
      await fs.access(filePath, fs.constants.R_OK)
    } catch (error) {
      debug(error)

      await updateEnergyDataFileAsFailed(
        {
          fileId: dataFile.fileId,
          processedTimeMillis: Date.now(),
          processedMessage: 'File access error.'
        },
        processorUser,
        emileDB
      )

      continue
    }

    /*
     * Validate parserClass is valid
     */

    if (
      !getParserClasses().includes(dataFile.parserProperties?.parserClass ?? '')
    ) {
      await updateEnergyDataFileAsFailed(
        {
          fileId: dataFile.fileId,
          processedTimeMillis: Date.now(),
          processedMessage: `Selected parser not found: ${
            dataFile.parserProperties?.parserClass ?? ''
          }`
        },
        processorUser,
        emileDB
      )

      continue
    }

    /*
     * Load the parser
     */

    let parser: BaseParser

    switch (dataFile.parserProperties?.parserClass ?? '') {
      case 'GreenButtonParser': {
        parser = new GreenButtonParser(dataFile)
        break
      }
      case 'SheetParser': {
        parser = new SheetParser(dataFile)
        break
      }
      default: {
        await updateEnergyDataFileAsFailed(
          {
            fileId: dataFile.fileId,
            processedTimeMillis: Date.now(),
            processedMessage: `Selected parser not implemented: ${
              (dataFile.parserProperties?.parserClass as string) ?? ''
            }`
          },
          processorUser,
          emileDB
        )

        continue
      }
    }

    /*
     * Parse the file
     */

    try {
      await parser.parseFile(emileDB)
    } catch {
      await updateEnergyDataFileAsFailed(
        {
          fileId: dataFile.fileId,
          processedTimeMillis: Date.now(),
          processedMessage: `Error parsing file: ${
            (dataFile.parserProperties?.parserClass as string) ?? ''
          }`
        },
        processorUser,
        emileDB
      )
    }
  }

  emileDB.close()

  isRunning = false

  if (!terminateTask && runAgainOnComplete) {
    runAgainOnComplete = false
    await processFiles()
  }
}

/*
 * Run the task
 */

await processFiles().catch((error) => {
  debug('Error running task.')
  debug(error)
})

const intervalID = setIntervalAsync(processFiles, 3600 * 1000)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})

/*
 * Respond to messaging
 */

process.on('message', (message: RunFileProcessorWorkerMessage) => {
  if (message.messageType === 'runFileProcessor') {
    debug('Running by request')
    void processFiles()
  }
})
