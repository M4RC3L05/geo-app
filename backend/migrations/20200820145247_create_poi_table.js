/**
 *
 * @param {import("knex")} knex
 */
exports.up = async (knex) => {
    await knex.raw("CREATE SCHEMA IF NOT EXISTS core");
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await knex.schema.withSchema("core").createTable("pois", (table) => {
        table
            .uuid("id")
            .primary()
            .unique()
            .defaultTo(knex.raw("uuid_generate_v4()"));
        table.specificType("geom", "geometry").notNullable();
        table.string("name").notNullable();
    });
};

exports.down = () => {
    throw new Error("Irreversible Migration");
};
