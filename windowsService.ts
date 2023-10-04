import path from 'node:path'

import type { ServiceConfig } from 'node-windows'

const _dirname = '.'

export const serviceConfig: ServiceConfig = {
  name: 'EMILE',
  description: 'Energy Monitoring in Less Effort',
  script: path.join(_dirname, 'bin', 'www.js')
}
