import path from 'node:path'

import type { ServiceConfig } from 'node-windows'

const _dirname = '.'

export const serviceConfig: ServiceConfig = {
  name: 'MonTY',
  description:
    'MONitor and Track Your...',
  script: path.join(_dirname, 'bin', 'www.js')
}
