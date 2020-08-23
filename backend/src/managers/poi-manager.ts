import Knex from "knex";
import KnexPostgis from "knex-postgis";

class PoiManager {
    private knex: Knex;
    private st: KnexPostgis.KnexPostgis;
    private tableName: string;

    constructor (knex: Knex, st: KnexPostgis.KnexPostgis) {
        this.tableName = "pois";
        this.knex = knex;
        this.st = st;
    }

    async getAllInRange({ center, range }) {
        if (!center || !range) return [];

        return await this.knex(this.tableName)
            .withSchema("core")
            .select("id", "name", this.st.asGeoJSON(this.st.centroid("geom")).as("geoJSON"))
            .where(
                this.st.dwithin(
                    this.st.centroid(this.st.transform("geom", 3857)),
                    this.st.centroid(
                        this.st.transform(
                            this.st.setSRID(
                                this.st.point(center.lng, center.lat),
                                4326
                            ),
                            3857
                        )
                    ),
                    range
                )
            );
    }

    async getById(id: string) {
        if (!id)
            return {};

        return await this.knex(this.tableName)
            .withSchema("core")
            .select("id", "name", this.st.asGeoJSON(this.st.centroid("geom")).as("geoJSON"))
            .where("id", "=", id)
            .first();
    }

    async searchPois(name: string) {
        if (!name)
            return []

        return await this.knex(this.tableName)
            .withSchema("core")
            .select("id", "name", this.st.asGeoJSON(this.st.centroid("geom")).as("geoJSON"))
            .where("name", "ilike", `%${name}%`)
            .limit(50)
    }
}

export default PoiManager;
