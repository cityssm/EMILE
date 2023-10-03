import { lookups as greenButtonLookups } from '@cityssm/green-button-parser'
import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { databasePath } from '../helpers/functions.database.js'

import { addAssetAliasType } from './addAssetAliasType.js'
import { addAssetCategory } from './addAssetCategory.js'
import { addEnergyAccumulationBehaviour } from './addEnergyAccumulationBehaviour.js'
import { addEnergyCommodity } from './addEnergyCommodity.js'
import { addEnergyReadingType } from './addEnergyReadingType.js'
import { addEnergyServiceCategory } from './addEnergyServiceCategory.js'
import { addEnergyUnit } from './addEnergyUnit.js'
import { addUser } from './addUser.js'
import { refreshEnergyDataTableView } from './manageEnergyDataTables.js'

const debug = Debug('emile:database:initializeDatabase')

const initializeDatabaseUser: EmileUser = {
  userName: 'system.initialize',
  canLogin: false,
  canUpdate: true,
  isAdmin: true
}

export const recordColumns = ` recordCreate_userName varchar(30) not null,
    recordCreate_timeMillis integer not null,
    recordUpdate_userName varchar(30) not null,
    recordUpdate_timeMillis integer not null,
    recordDelete_userName varchar(30),
    recordDelete_timeMillis integer`

const greenButtonColumns = ' greenButtonId varchar(50)'

const orderNumberColumns = ' orderNumber integer not null default 0'

function initializeEnergyServiceCategories(emileDB: sqlite.Database): void {
  emileDB
    .prepare(
      `create table if not exists EnergyServiceCategories (
        serviceCategoryId integer primary key autoincrement,
        serviceCategory varchar(100) not null,
        ${greenButtonColumns},
        ${orderNumberColumns},
        ${recordColumns}
  )`
    )
    .run()

  const result = emileDB
    .prepare('select serviceCategoryId from EnergyServiceCategories limit 1')
    .get()

  if (result === undefined) {
    for (const [greenButtonId, serviceCategory] of Object.entries(
      greenButtonLookups.serviceCategoryKinds
    )) {
      addEnergyServiceCategory(
        {
          serviceCategory,
          greenButtonId
        },
        initializeDatabaseUser,
        emileDB
      )
    }
  }
}

function initializeEnergyUnits(emileDB: sqlite.Database): void {
  emileDB
    .prepare(
      `create table if not exists EnergyUnits (
        unitId integer primary key autoincrement,
        unit varchar(100) not null,
        unitLong varchar(100) not null,
        preferredPowerOfTenMultiplier integer not null default 0,
        ${greenButtonColumns},
        ${orderNumberColumns},
        ${recordColumns}
      )`
    )
    .run()

  const result = emileDB.prepare('select unitId from EnergyUnits limit 1').get()

  if (result === undefined) {
    for (const [greenButtonId, unit] of Object.entries(
      greenButtonLookups.unitsOfMeasurement
    )) {
      addEnergyUnit(
        {
          unit,
          unitLong: unit,
          preferredPowerOfTenMultiplier: unit === 'Wh' ? 3 : 0,
          greenButtonId
        },
        initializeDatabaseUser,
        emileDB
      )
    }
  }
}

function initializeEnergyReadingTypes(emileDB: sqlite.Database): void {
  emileDB
    .prepare(
      `create table if not exists EnergyReadingTypes (
        readingTypeId integer primary key autoincrement,
        readingType varchar(100) not null,
        ${greenButtonColumns},
        ${orderNumberColumns},
        ${recordColumns}
      )`
    )
    .run()

  const result = emileDB
    .prepare('select readingTypeId from EnergyReadingTypes limit 1')
    .get()

  if (result === undefined) {
    for (const [greenButtonId, readingType] of Object.entries(
      greenButtonLookups.readingTypeKinds
    )) {
      addEnergyReadingType(
        {
          readingType,
          greenButtonId
        },
        initializeDatabaseUser,
        emileDB
      )
    }
  }
}

function initializeEnergyCommodities(emileDB: sqlite.Database): void {
  emileDB
    .prepare(
      `create table if not exists EnergyCommodities (
        commodityId integer primary key autoincrement,
        commodity varchar(100) not null,
        ${greenButtonColumns},
        ${orderNumberColumns},
        ${recordColumns}
      )`
    )
    .run()

  const result = emileDB
    .prepare('select commodityId from EnergyCommodities limit 1')
    .get()

  if (result === undefined) {
    for (const [greenButtonId, commodity] of Object.entries(
      greenButtonLookups.commodities
    )) {
      addEnergyCommodity(
        {
          commodity,
          greenButtonId
        },
        initializeDatabaseUser,
        emileDB
      )
    }
  }
}

function initializeEnergyAccumulationBehaviours(
  emileDB: sqlite.Database
): void {
  emileDB
    .prepare(
      `create table if not exists EnergyAccumulationBehaviours (
        accumulationBehaviourId integer primary key autoincrement,
        accumulationBehaviour varchar(100) not null,
        ${greenButtonColumns},
        ${orderNumberColumns},
        ${recordColumns}
      )`
    )
    .run()

  const result = emileDB
    .prepare(
      'select accumulationBehaviourId from EnergyAccumulationBehaviours limit 1'
    )
    .get()

  if (result === undefined) {
    for (const [greenButtonId, accumulationBehaviour] of Object.entries(
      greenButtonLookups.accumulationBehaviours
    )) {
      addEnergyAccumulationBehaviour(
        {
          accumulationBehaviour,
          greenButtonId
        },
        initializeDatabaseUser,
        emileDB
      )
    }
  }
}

function initializeAssetCategories(emileDB: sqlite.Database): void {
  emileDB
    .prepare(
      `create table if not exists AssetCategories (
        categoryId integer primary key autoincrement,
        category varchar(100) not null,
        fontAwesomeIconClasses varchar(50),
        ${orderNumberColumns},
        ${recordColumns}
      )`
    )
    .run()

  const result = emileDB
    .prepare('select categoryId from AssetCategories limit 1')
    .get()

  if (result === undefined) {
    addAssetCategory(
      {
        category: 'Building',
        fontAwesomeIconClasses: 'far fa-building'
      },
      initializeDatabaseUser,
      emileDB
    )

    addAssetCategory(
      {
        category: 'Street Light',
        fontAwesomeIconClasses: 'far fa-lightbulb'
      },
      initializeDatabaseUser,
      emileDB
    )

    addAssetCategory(
      {
        category: 'Traffic Light',
        fontAwesomeIconClasses: 'fas fa-traffic-light'
      },
      initializeDatabaseUser,
      emileDB
    )

    addAssetCategory(
      {
        category: 'Outdoor Lighting',
        fontAwesomeIconClasses: 'fas fa-sun'
      },
      initializeDatabaseUser,
      emileDB
    )

    addAssetCategory(
      {
        category: 'Outdoor Pool',
        fontAwesomeIconClasses: 'fas fa-swimming-pool'
      },
      initializeDatabaseUser,
      emileDB
    )

    addAssetCategory(
      {
        category: 'Parking Lot',
        fontAwesomeIconClasses: 'fas fa-parking'
      },
      initializeDatabaseUser,
      emileDB
    )

    addAssetCategory(
      {
        category: 'Pump Station',
        fontAwesomeIconClasses: 'fas fa-tint'
      },
      initializeDatabaseUser,
      emileDB
    )
  }
}

function initializeAssetAliasTypes(emileDB: sqlite.Database): void {
  emileDB
    .prepare(
      `create table if not exists AssetAliasTypes (
        aliasTypeId integer primary key autoincrement,
        aliasType varchar(100) not null,
        regularExpression varchar(500),
        aliasTypeKey varchar(500),
        ${orderNumberColumns},
        ${recordColumns}
      )`
    )
    .run()

  const result = emileDB
    .prepare('select aliasTypeId from AssetAliasTypes limit 1')
    .get()

  if (result === undefined) {
    addAssetAliasType(
      {
        aliasType: 'Civic Address',
        aliasTypeKey: 'civicAddress',
        orderNumber: 1
      },
      initializeDatabaseUser
    )

    addAssetAliasType(
      {
        aliasType: 'Electricity Account Number',
        aliasTypeKey: 'accountNumber.electricity',
        orderNumber: 2
      },
      initializeDatabaseUser
    )

    addAssetAliasType(
      {
        aliasType: 'Gas Account Number',
        aliasTypeKey: 'accountNumber.gas',
        orderNumber: 3
      },
      initializeDatabaseUser
    )

    addAssetAliasType(
      {
        aliasType: 'Green Button Interval Block Link',
        aliasTypeKey: 'GreenButtonParser.IntervalBlock.link',
        orderNumber: 4
      },
      initializeDatabaseUser
    )
  }
}

export async function initializeDatabase(): Promise<void> {
  const emileDB = sqlite(databasePath)

  const row = emileDB
    .prepare(
      `select name from sqlite_master
        where type = 'table'
        and name = 'UserAccessLog'`
    )
    .get() as { name: string } | undefined

  if (row !== undefined) {
    emileDB.close()
    return
  }

  debug(`Creating ${databasePath} ...`)

  /*
   * Energy Data Types
   */

  initializeEnergyServiceCategories(emileDB)
  initializeEnergyUnits(emileDB)
  initializeEnergyReadingTypes(emileDB)
  initializeEnergyCommodities(emileDB)
  initializeEnergyAccumulationBehaviours(emileDB)

  emileDB
    .prepare(
      `create table if not exists EnergyDataTypes (
        dataTypeId integer primary key autoincrement,
        serviceCategoryId integer not null references EnergyServiceCategories (serviceCategoryId),
        unitId integer not null references EnergyUnits (unitId),
        readingTypeId integer references EnergyReadingTypes (readingTypeId),
        commodityId integer references EnergyCommodities (commodityId),
        accumulationBehaviourId integer references EnergyAccumulationBehaviours (accumulationBehaviourId),
        ${recordColumns}
      )`
    )
    .run()

  /*
   * Data Files
   */

  emileDB
    .prepare(
      `create table if not exists EnergyDataFiles (
        fileId integer primary key autoincrement,
        originalFileName varchar(200) not null,
        systemFileName varchar(200) not null,
        systemFolderPath varchar(200) not null,
        assetId integer,
        isPending bit not null default 1,
        parserPropertiesJson text,
        processedTimeMillis integer,
        isFailed bit not null default 0,
        processedMessage text,
        ${recordColumns}
      )`
    )
    .run()

  /*
   * Assets
   */

  initializeAssetCategories(emileDB)

  emileDB
    .prepare(
      `create table if not exists Assets (
        assetId integer primary key autoincrement,
        assetName varchar(100) not null,
        categoryId integer not null references AssetCategories (categoryId),
        latitude decimal(8, 6) check (latitude >= -90 and latitude <= 90),
        longitude decimal(9, 6) check (longitude >= -180 and longitude <= 180),
        timeSecondsMin integer,
        endTimeSecondsMax integer,
        ${recordColumns}
      )`
    )
    .run()

  /*
   * Asset Aliases
   */

  initializeAssetAliasTypes(emileDB)

  emileDB
    .prepare(
      `create table if not exists AssetAliases (
        aliasId integer primary key autoincrement,
        assetId integer not null references Assets (assetId),
        aliasTypeId integer not null references AssetAliasTypes (aliasTypeId),
        assetAlias varchar(500) not null,
        ${recordColumns},
        unique (aliasTypeId, assetAlias, recordDelete_timeMillis)
      )`
    )
    .run()

  /*
   * Asset Groups
   */

  emileDB
    .prepare(
      `create table if not exists AssetGroups (
        groupId integer primary key autoincrement,
        groupName varchar(100) not null,
        groupDescription text,
        isShared bit not null default 0,
        ${recordColumns}
      )`
    )
    .run()

  /*
   * Asset Group Members
   */

  emileDB
    .prepare(
      `create table if not exists AssetGroupMembers (
        groupId integer not null references AssetGroups (groupId),
        assetId integer not null references Assets (assetId),
        ${recordColumns},
        primary key (groupId, assetId)
      )`
    )
    .run()

  /*
   * Energy Data
   */

  await refreshEnergyDataTableView(emileDB)

  /*
   * Users
   */

  emileDB
    .prepare(
      `create table if not exists Users (
        userName varchar(30) primary key,
        canLogin bit not null default 0,
        canUpdate bit not null default 0,
        isAdmin bit not null default 0,
        reportKey varchar(100) check (length(reportKey) >= 36),
        ${recordColumns}
      )`
    )
    .run()

  // TODO: Remove initializing d.gowans user

  const result = emileDB.prepare('select userName from Users limit 1').get()

  if (result === undefined) {
    addUser(
      {
        userName: 'd.gowans',
        canLogin: true,
        canUpdate: true,
        isAdmin: true
      },
      initializeDatabaseUser,
      emileDB
    )
  }

  emileDB
    .prepare(
      `create table if not exists UserAccessLog (
        userName varchar(30) not null,
        ipAddress varchar(100) not null,
        accessTimeMillis integer not null
      )`
    )
    .run()

  emileDB
    .prepare(
      'create index idx_UserAccessLog on UserAccessLog (accessTimeMillis, ipAddress, userName)'
    )
    .run()

  /*
   * Close Database
   */

  emileDB.close()

  debug('Database created successfully.')
}
