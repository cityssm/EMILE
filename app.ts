/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable import/no-named-as-default-member */

import path from 'node:path'

import { abuseCheck } from '@cityssm/express-abuse-points'
import * as dateTimeFns from '@cityssm/utils-datetime'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import Debug from 'debug'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import createError from 'http-errors'
import FileStore from 'session-file-store'

import handler_notify from './handlers/data-all/notify.js'
import handler_redirect from './handlers/data-all/redirect.js'
import { adminGetHandler, updateGetHandler } from './handlers/permissions.js'
import configFunctions, {
  getConfigProperty
} from './helpers/functions.config.js'
import {
  hasActiveSession,
  sessionHandler
} from './helpers/functions.session.js'
import routerAdmin from './routes/admin.js'
import routerAssets from './routes/assets.js'
import routerDashboard from './routes/dashboard.js'
import routerData from './routes/data.js'
import routerLogin from './routes/login.js'
import routerReports from './routes/reports.js'
import { version } from './version.js'

const debug = Debug(`emile:app:${process.pid}`)

/*
 * INITIALIZE APP
 */

if (getConfigProperty('tempUsers').length > 0) {
  debug('Temporary user accounts currently active!')
}

export const app = express()

app.disable('X-Powered-By')

if (!getConfigProperty('reverseProxy.disableEtag')) {
  app.set('etag', false)
}

// View engine setup
app.set('views', path.join('views'))
app.set('view engine', 'ejs')

if (!getConfigProperty('reverseProxy.disableCompression')) {
  app.use(compression())
}

app.use((request, _response, next) => {
  debug(`${request.method} ${request.url}`)
  next()
})

app.use(express.json())

app.use(
  express.urlencoded({
    extended: false
  })
)

app.use(cookieParser())
app.use(
  csurf({
    cookie: true
  })
)

/*
 * Rate Limiter
 */

app.use(
  rateLimit({
    windowMs: 10_000,
    max: 200
  })
)

/*
 * Abuse Check
 */

const abuseCheckHandler = abuseCheck()

/*
 * STATIC ROUTES
 */

const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

if (urlPrefix !== '') {
  debug(`urlPrefix = ${urlPrefix}`)
}

app.use(urlPrefix, express.static(path.join('public')))

app.use(
  '/favicon.ico',
  express.static(path.join('public', 'images', 'favicon', 'favicon.ico'))
)

app.use(
  `${urlPrefix}/favicon.ico`,
  express.static(path.join('public', 'images', 'favicon', 'favicon.ico'))
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-js/bulma-js.js`,
  express.static(
    path.join('node_modules', '@cityssm', 'bulma-js', 'dist', 'bulma-js.js')
  )
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-webapp-js`,
  express.static(
    path.join('node_modules', '@cityssm', 'bulma-webapp-js', 'dist')
  )
)

app.use(
  `${urlPrefix}/lib/chartJs`,
  express.static(path.join('node_modules', 'chart.js', 'dist'))
)

app.use(
  `${urlPrefix}/lib/fa`,
  express.static(path.join('node_modules', '@fortawesome', 'fontawesome-free'))
)

/*
 * SESSION MANAGEMENT
 */

const sessionCookieName: string = getConfigProperty('session.cookieName')

const FileStoreSession = FileStore(session)

// Initialize session
app.use(
  session({
    store: new FileStoreSession({
      path: './data/sessions',
      logFn: Debug(`emile:session:${process.pid}`),
      retries: 20
    }),
    name: sessionCookieName,
    secret: getConfigProperty('session.secret'),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: getConfigProperty('session.maxAgeMillis'),
      sameSite: 'strict'
    }
  })
)

// Clear cookie if no corresponding session
app.use((request, response, next) => {
  if (
    Object.hasOwn(request.cookies, sessionCookieName) &&
    !Object.hasOwn(request.session, 'user')
  ) {
    response.clearCookie(sessionCookieName)
  }

  next()
})

/*
 * ROUTES
 */

// Make the user and config objects available to the templates

app.use((request, response, next) => {
  response.locals.buildNumber = version

  response.locals.user = request.session.user
  response.locals.csrfToken = request.csrfToken()

  response.locals.configFunctions = configFunctions
  response.locals.dateTimeFunctions = dateTimeFns

  response.locals.urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

  next()
})

app.get(`${urlPrefix}/`, sessionHandler, (_request, response) => {
  response.redirect(`${urlPrefix}/dashboard`)
})

app.use(`${urlPrefix}/dashboard`, sessionHandler, routerDashboard)
app.use(`${urlPrefix}/assets`, sessionHandler, routerAssets)
app.use(`${urlPrefix}/data/notify`, handler_notify)
app.use(`${urlPrefix}/data/redirect`, handler_redirect)
app.use(`${urlPrefix}/data`, sessionHandler, updateGetHandler, routerData)
app.use(`${urlPrefix}/admin`, sessionHandler, adminGetHandler, routerAdmin)

// session checked in router
app.use(`${urlPrefix}/reports`, routerReports)

app.use(
  `${urlPrefix}/backups`,
  sessionHandler,
  adminGetHandler,
  express.static(path.join('data', 'backups'))
)

if (getConfigProperty('session.doKeepAlive')) {
  app.all(`${urlPrefix}/keepAlive`, (_request, response) => {
    response.json(true)
  })
}

app.use(`${urlPrefix}/login`, abuseCheckHandler, routerLogin)

app.get(`${urlPrefix}/logout`, (request, response) => {
  if (hasActiveSession(request)) {
    request.session.destroy(() => {
      response.clearCookie(sessionCookieName)
      response.redirect(`${urlPrefix}/`)
    })
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
})

// Catch 404 and forward to error handler
app.use((request, _response, next) => {
  debug(request.url)
  next(createError(404, `File not found: ${request.url}`))
})

export default app
