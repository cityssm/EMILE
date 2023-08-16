import fs from 'node:fs/promises'
import path from 'node:path'

import Debug from 'debug'
import exitHook from 'exit-hook'
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'

import { getEnergyDataFilesToProcess } from '../database/getEnergyDataFiles.js'
import { updateEnergyDataFileAsFailed } from '../database/updateEnergyDataFile.js'
import type { BaseParser } from '../parsers/baseParser.js'
import { CsvParser } from '../parsers/csvParser.js'
import { GreenButtonParser } from '../parsers/greenButtonParser.js'
import { getParserClasses } from '../parsers/parserHelpers.js'
import type { RunFileProcessorWorkerMessage } from '../types/applicationTypes.js'

const debug = Debug('emile:tasks:energyDataFilesProcessor')

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

  const dataFiles = getEnergyDataFilesToProcess()

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

      updateEnergyDataFileAsFailed(
        {
          fileId: dataFile.fileId as number,
          processedTimeMillis: Date.now(),
          processedMessage: 'File access error.'
        },
        processorUser
      )

      continue
    }

    /*
     * Validate parserClass is valid
     */

    if (
      !getParserClasses().includes(dataFile.parserProperties?.parserClass ?? '')
    ) {
      updateEnergyDataFileAsFailed(
        {
          fileId: dataFile.fileId as number,
          processedTimeMillis: Date.now(),
          processedMessage: `Selected parser not found: ${
            dataFile.parserProperties?.parserClass ?? ''
          }`
        },
        processorUser
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
      case 'CsvParser': {
        parser = new CsvParser(dataFile)
        break
      }
      default: {
        updateEnergyDataFileAsFailed(
          {
            fileId: dataFile.fileId as number,
            processedTimeMillis: Date.now(),
            processedMessage: `Selected parser not implemented: ${
              (dataFile.parserProperties?.parserClass as string) ?? ''
            }`
          },
          processorUser
        )

        continue
      }
    }

    /*
     * Parse the file
     */

    try {
      await parser.parseFile()
    } catch {
      updateEnergyDataFileAsFailed(
        {
          fileId: dataFile.fileId as number,
          processedTimeMillis: Date.now(),
          processedMessage: `Error parsing file: ${
            (dataFile.parserProperties?.parserClass as string) ?? ''
          }`
        },
        processorUser
      )
    }
  }

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

const intervalID = setIntervalAsync(processFiles, 10 * 60 * 1000)

exitHook(() => {
  terminateTask = true
  try {
    void clearIntervalAsync(intervalID)
  } catch {
    debug('Error exiting task.')
  }
})

/*
 * Response to messaging
 */

/*
 * Respond to messaging
 */

process.on('message', (message: RunFileProcessorWorkerMessage) => {
  if (message.messageType === 'runFileProcessor') {
    debug('Running by request')
    void processFiles()
  }
})
