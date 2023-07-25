import { lookups as greenButtonLookups } from '@cityssm/green-button-parser';
import sqlite from 'better-sqlite3';
import Debug from 'debug';
import { emileDB as databasePath } from '../helpers/functions.database.js';
import { addEnergyAccumulationBehaviour } from './addEnergyAccumulationBehaviour.js';
import { addEnergyCommodity } from './addEnergyCommodity.js';
import { addEnergyReadingType } from './addEnergyReadingType.js';
import { addEnergyServiceCategory } from './addEnergyServiceCategory.js';
import { addEnergyUnit } from './addEnergyUnit.js';
const debug = Debug('emile:database:initializeDatabase');
const initializeDatabaseUser = {
    userName: 'system.initialize',
    canLogin: false,
    isAdmin: true
};
const recordColumns = ` recordCreate_userName varchar(30) not null,
    recordCreate_timeMillis integer not null,
    recordUpdate_userName varchar(30) not null,
    recordUpdate_timeMillis integer not null,
    recordDelete_userName varchar(30),
    recordDelete_timeMillis integer`;
const greenButtonColumns = ' greenButtonId varchar(50)';
export function initializeDatabase() {
    const emileDB = sqlite(databasePath);
    const row = emileDB
        .prepare(`select name from sqlite_master
        where type = 'table'
        and name = 'Users'`)
        .get();
    if (row !== undefined) {
        emileDB.close();
        return;
    }
    debug(`Creating ${databasePath} ...`);
    let runResult = emileDB
        .prepare(`create table if not exists EnergyServiceCategories (
        serviceCategoryId integer primary key autoincrement,
        serviceCategory varchar(100) not null,
        ${greenButtonColumns},
        ${recordColumns}
    )`)
        .run();
    if (runResult.changes > 0) {
        for (const [greenButtonId, serviceCategory] of Object.entries(greenButtonLookups.serviceCategoryKinds)) {
            addEnergyServiceCategory({
                serviceCategory,
                greenButtonId
            }, initializeDatabaseUser, emileDB);
        }
    }
    runResult = emileDB
        .prepare(`create table if not exists EnergyUnits (
        unitId integer primary key autoincrement,
        unit varchar(100) not null,
        unitLong varchar(100) not null,
        ${greenButtonColumns},
        ${recordColumns}
      )`)
        .run();
    if (runResult.changes > 0) {
        for (const [greenButtonId, unit] of Object.entries(greenButtonLookups.unitsOfMeasurement)) {
            addEnergyUnit({
                unit,
                unitLong: unit,
                greenButtonId
            }, initializeDatabaseUser, emileDB);
        }
    }
    runResult = emileDB
        .prepare(`create table if not exists EnergyReadingTypes (
        readingTypeId integer primary key autoincrement,
        readingType varchar(100) not null,
        ${greenButtonColumns},
        ${recordColumns}
      )`)
        .run();
    if (runResult.changes > 0) {
        for (const [greenButtonId, readingType] of Object.entries(greenButtonLookups.readingTypeKinds)) {
            addEnergyReadingType({
                readingType,
                greenButtonId
            }, initializeDatabaseUser, emileDB);
        }
    }
    runResult = emileDB
        .prepare(`create table if not exists EnergyCommodities (
      commodityId integer primary key autoincrement,
      commodity varchar(100) not null,
      ${greenButtonColumns},
      ${recordColumns}
    )`)
        .run();
    if (runResult.changes > 0) {
        for (const [greenButtonId, commodity] of Object.entries(greenButtonLookups.commodities)) {
            addEnergyCommodity({
                commodity,
                greenButtonId
            }, initializeDatabaseUser, emileDB);
        }
    }
    runResult = emileDB
        .prepare(`create table if not exists EnergyAccumulationBehaviours (
        accumulationBehaviourId integer primary key autoincrement,
        accumulationBehaviour varchar(100) not null,
        ${greenButtonColumns},
        ${recordColumns}
      )`)
        .run();
    if (runResult.changes > 0) {
        for (const [greenButtonId, accumulationBehaviour] of Object.entries(greenButtonLookups.accumulationBehaviours)) {
            addEnergyAccumulationBehaviour({
                accumulationBehaviour,
                greenButtonId
            }, initializeDatabaseUser, emileDB);
        }
    }
    emileDB
        .prepare(`create table if not exists EnergyDataTypes (
        dataTypeId integer primary key autoincrement,
        serviceCategoryId integer not null,
        unitId integer not null,
        readingTypeId integer not null,
        commodityId integer not null,
        accumulationBehaviourId integer not null,
        ${greenButtonColumns},
        ${recordColumns},
        foreign key (serviceCategoryId) references EnergyServiceCategories (serviceCategoryId),
        foreign key (unitId) references EnergyUnits (unitId),
        foreign key (readingTypeId) references EnergyReadingTypes (readingTypeId),
        foreign key (commodityId) references EnergyCommodities (commodityId),
        foreign key (accumulationBehaviourId) references EnergyAccumulationBehaviours (accumulationBehaviourId),
      )`)
        .run();
    emileDB
        .prepare(`create table if not exists Users (
        userName varchar(30) primary key,
        canLogin bit not null default 0,
        isAdmin bit not null default 0,
        ${recordColumns}
      )`)
        .run();
    emileDB.close();
    debug('Database created successfully.');
}
