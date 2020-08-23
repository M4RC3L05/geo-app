import { RouterContext } from "@koa/router";
import PoiManager from "managers/poi-manager";


export const index = (poiManager: PoiManager) => async (ctx: RouterContext) => {
    const { center = [], range } = ctx.query;
    const pois = await poiManager.getAllInRange({ center: { lng: center[0], lat: center[1] }, range });

    ctx.body = {
        pois
    };
};

export const show = (poiManager: PoiManager) => async (ctx: RouterContext) => {
    const { id } = ctx.params;
    const poi = await poiManager.getById(id);

    ctx.body = {
        poi
    };
};

export const search = (PoiManager: PoiManager) => async (ctx: RouterContext) => {
    const { name } = ctx.request.query
    const pois = await PoiManager.searchPois(name)

    ctx.body = {
        pois
    }
}
