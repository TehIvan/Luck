const { readdir, readFile, writeFile } = require("fs/promises");
const express = require("express");

module.exports = class Luck {

    pages = [];

    constructor(port, pagesDirectory, outputDirectory, template) {
        this.port = port;
        this.pagesDirectory = pagesDirectory;
        this.outputDirectory = outputDirectory;
        this.template = template;
        console.log(`\nPort: ${port}\nPages: ${pagesDirectory}\nOutput: ${outputDirectory}\n`)
    }

    async loadPages() {
        const files = await readdir(this.pagesDirectory);
        
        console.log("Luck => Loading pages..\n")

        for (const fileName of files) {
            let data = require(this.pagesDirectory + "/" + fileName)
            await this.loadPage(data, fileName);
        }
    }

    async loadPage(data, fileName) {
        if (data.path == undefined) {
            console.log("Path not defined in " + fileName)
            process.exit();
        }

        const path = `${this.outputDirectory}/${fileName.replace(".json", ".ejs")}`;
        
        let html = await readFile(this.template, {
            encoding: "utf-8"
        });

        html = html.trim();

        let out = html.indexOf("</body>");

        let firstHalf = html.substring(0, out);
        let secondHalf = html.substr(out, html.length);

        firstHalf += await this.getHtml(data.content);
        
        html = firstHalf.concat(secondHalf);

        await writeFile(path, html)

        this.pages.push({
            fileName,
            ... data
        });
    }

    async getHtml(data) {
        let html = "";
        for (const key of Object.keys(data)) {

            let d = data[key];

            if (typeof(d) == "object") {
                d = d.map(r => r).join("<br>");
            }

            if (key.includes(".")) {
                const element = key.split(".")[0];
                const classes = key.split(".").slice(1, key.length);
                
                html += `<${element} class="${classes.map(r => r).join(" ")}">${d}</${element}>`
            } else {
                html += `<${key}>${d}</${key}>`
            }
        }
        return html;
    }

    async startServer() {
        console.log("Luck => Starting server..\n");
        this.server = express();

        this.server.set('views', this.outputDirectory);
        this.server.set("view engine", "ejs");

        for (const page of this.pages) {
            this.server.get(page.path, (req, res) => res.render(page.fileName.replace(".json", "")));
        }

        this.server.listen(this.port, () => {
            console.log("Luck => Server started on port " + this.port + "\n");
        })
    }

    async loadPaths(obj) {
        for (const key of Object.keys(obj)) {
            this.server.get(`/${key}`, obj[key])
        }
    }
}