import knex from "knex";
import knexPostgis from 'knex-postgis';
import config from 'config';

const db = knex(config.get("database"));

export const st = knexPostgis(db);

export default db;
