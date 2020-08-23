
import * as poisController from 'controllers/pois-controller';
import KoaRouter from '@koa/router';
import PoiManager from "managers/poi-manager";
import db, { st } from "core/database";

const router = new KoaRouter();

router.get("/", poisController.index(new PoiManager(db, st)));
router.get("/search", poisController.search(new PoiManager(db, st)));
router.get("/:id", poisController.show(new PoiManager(db, st)));
export default router;
