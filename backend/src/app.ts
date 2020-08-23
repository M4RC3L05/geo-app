import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaCors from '@koa/cors';
import rootRouter from "router";

const app = new Koa();

app.use(koaCors());
app.use(bodyParser());
app.use(rootRouter.routes());
app.use(rootRouter.allowedMethods());

export default app;
