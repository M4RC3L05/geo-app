
import KoaRouter from '@koa/router';
import poisRouter from "router/pois-router";

const rootRouter = new KoaRouter();

rootRouter.use("/pois", poisRouter.routes(), poisRouter.allowedMethods());

export default rootRouter;
