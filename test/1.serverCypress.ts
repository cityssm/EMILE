import * as assert from 'node:assert'
import { exec } from 'node:child_process'
import * as http from 'node:http'

import { app } from '../app.js'

import { portNumber } from './_globals.js'

function runCypress(browser: 'chrome' | 'firefox', done: () => void): void {
  let cypressCommand = `cypress run --config-file cypress.config.js --browser ${browser}`

  if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '') {
    cypressCommand += ` --tag "${browser},${process.version}" --record`
  }

  const childProcess = exec(cypressCommand)

  childProcess.stdout?.on('data', (data) => {
    console.log(data)
  })

  childProcess.stderr?.on('data', (data) => {
    console.error(data)
  })

  childProcess.on('exit', (code) => {
    assert.ok(code === 0)
    done()
  })
}

describe('EMILE', () => {
  const httpServer = http.createServer(app)

  let serverStarted = false

  before(() => {
    httpServer.listen(portNumber)

    httpServer.on('listening', () => {
      serverStarted = true
    })
  })

  after(() => {
    try {
      httpServer.close()
    } catch {
      // ignore
    }
  })

  it(`Ensure server starts on port ${portNumber.toString()}`, () => {
    assert.ok(serverStarted)
  })

  describe('Cypress tests', () => {
    it('Should run Cypress tests in Chrome', (done) => {
      runCypress('chrome', done)
    }).timeout(30 * 60 * 60 * 1000)

    it('Should run Cypress tests in Firefox', (done) => {
      runCypress('firefox', done)
    }).timeout(30 * 60 * 60 * 1000)
  })
})
