const Luck = require("../Luck");

const luck = new Luck(3000, process.cwd() + "/pages", process.cwd() + "/views", process.cwd() + "/template.html");

(async() => {
    await luck.loadPages();
    await luck.startServer();
})();