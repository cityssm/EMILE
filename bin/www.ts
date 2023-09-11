import '../helpers/polyfills.js'

import { fork, type ChildProcess } from 'node:child_process'
import type { Worker } from 'node:cluster'
import cluster from 'node:cluster'
import os from 'node:os'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import Debug from 'debug'

import { initializeDatabase } from '../database/initializeDatabase.js'
import { getConfigProperty } from '../helpers/functions.config.js'
import type { WorkerMessage } from '../types/applicationTypes.js'

const debug = Debug(`emile:www:${process.pid}`)

process.title = `${getConfigProperty('application.applicationName')} (Primary)`

debug(`Primary pid:   ${process.pid}`)
debug(`Primary title: ${process.title}`)

/*
 * Initialize Database
 */

initializeDatabase()

/*
 * Start Processes
 */

const processCount = Math.min(
  getConfigProperty('application.maximumProcesses'),
  os.cpus().length
)

debug(`Launching ${processCount} processes`)

const directoryName = dirname(fileURLToPath(import.meta.url))

const clusterSettings = {
  exec: `${directoryName}/wwwProcess.js`
}

cluster.setupPrimary(clusterSettings)

const activeWorkers = new Map<number, Worker>()
let fileProcessorChildProcess: ChildProcess

for (let index = 0; index < processCount; index += 1) {
  const worker = cluster.fork()
  if (worker.process.pid !== undefined) {
    activeWorkers.set(worker.process.pid, worker)
  }
}

cluster.on('message', (worker, message: WorkerMessage) => {
  switch (message.messageType) {
    case 'clearCache': {
      for (const [pid, activeWorker] of activeWorkers.entries()) {
        if (activeWorker === undefined || pid === message.pid) {
          continue
        }

        debug(`Relaying message to worker: ${pid}`)
        activeWorker.send(message)
      }
      break
    }
    case 'runFileProcessor': {
      if (
        fileProcessorChildProcess === undefined ||
        fileProcessorChildProcess.exitCode !== null
      ) {
        debug('File Processor Child Process unavailable.')
      } else {
        fileProcessorChildProcess.send(message)
      }

      break
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      debug(`Ignoring unknown message type: ${message.messageType}`)
    }
  }
})

cluster.on('exit', (worker) => {
  debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`)
  activeWorkers.delete(worker.process.pid ?? 0)

  debug('Starting another worker')

  const newWorker = cluster.fork()

  if (newWorker.process.pid !== undefined) {
    activeWorkers.set(newWorker.process.pid, newWorker)
  }
})

if (process.env.STARTUP_TEST === 'true') {
  const killSeconds = 10

  debug(`Killing processes in ${killSeconds} seconds...`)

  setTimeout(() => {
    debug('Killing processes')

    // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
    process.exit(0)
  }, 10_000)
} else {
  fork('./tasks/uploadedFilesProcessor.js')
  fork('./tasks/deletedFilesProcessor.js')

  fileProcessorChildProcess = fork('./tasks/energyDataFilesProcessor.js')
}
