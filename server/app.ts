import Koa from "koa";
import koaRouter from "koa-router";
import cors from "@koa/cors";
import views from "koa-views";
import path from "path";
import koaStatic from "koa-static";

const router = new koaRouter();
const app = new Koa();
const port = 3333;
const render = views(path.join(__dirname, "../example"));

app.use(koaStatic("."));
app.use(render);
app.use(
  cors({
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
  })
);

router.post("/api/reportUrl", async (ctx) => {
  await sleep(Math.floor(Math.random() * 1000));
  ctx.body = "success";
});

router.post("/api/post/success", async (ctx) => {
  // console.log("ctx", ctx?.req);
  await sleep(Math.floor(Math.random() * 1000));
  ctx.body = "success";
});

router.get("/api/404", async (ctx) => {
  ctx.status = 404;
});

router.get("/api/500", async (ctx) => {
  ctx.status = 500;
});

router.get("/api/timeout", async () => {
  await sleep(50000);
});

router.get("/api/success", async (ctx) => {
  // console.log("ctx", ctx?.req);
  // await sleep(2000);
  ctx.body = "success";
});

router.get("/", async (ctx) => {
  await (ctx as any).render("index");
});

async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
}

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port);
console.log(`Server is now listening on: http://localhost:${port}`);
