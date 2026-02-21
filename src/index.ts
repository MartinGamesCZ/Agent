import { Application } from "./Application";

const app = Application.getInstance();

await app.start();

setInterval(() => {}, 2000);
