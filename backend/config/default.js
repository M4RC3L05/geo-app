module.exports = {
    database: {
        client: 'postgresql',
        searchPath: ["public", "core"],
        connection: {
            database: 'dev_db',
            user: 'dev_user',
            password: 'dev_password'
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
