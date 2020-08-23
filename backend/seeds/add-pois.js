
const knexPostgis = require("knex-postgis");
const path  = require("path")
const csvToJSON = require("csvtojson")

/**
 *
 * @param {import("knex")} knex
 *
 */
exports.seed = async (knex) => {
    try {
        const dataCSV = path.resolve(__dirname, "./../data/data.csv")
        const json = await csvToJSON({delimiter: ","})
            .fromFile(dataCSV)
        const st = knexPostgis(knex);

        await knex.del().from("pois");
        const res = await knex.transaction((trx) => trx.batchInsert("core.pois", json.map(x => ({ name: x.NAME, geom: st.geomFromText(x.WKT, x.SRID) })), 1000).returning("id"));
        console.log(res.length)
    } catch (e) {
        console.error("Someting went wrong", e.message);
    }
};
