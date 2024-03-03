const http = require("http"), url = require("url"), fs = require("fs");

http.createServer((req, res) => {
    let date = new Date();
    let dateDate = date.getDate() + "-" + date.toLocaleString("en-EN", { month: "long" }) + "-" + date.getFullYear();
    let logFile = ".\\logs\\log_" + dateDate + ".log";
    fs.mkdir("logs", {recursive: true}, mkdirErr => {
        if (mkdirErr) {
            console.log("mkdirErr occured")
        };

        let dateTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
        fs.appendFile(logFile, "URL: " + req.url + "\n"
            + "Timestamp: " + dateTime + "\n\n",
            (appendErr) => {
                if (appendErr) {
                    console.log("AppendFile error occured");
                } else {
                    console.log("Added to log.");
                }
        });
    })

    let q = new URL(req.url,  'http://localhost:8080');
    if (q.pathname == "") {
        q.pathname = "index.html";
    }
    if (q.pathname.includes("documentation")) {
        q.pathname = "documentation.html";
    }

    let file = process.cwd() + q.pathname;
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead("500");
            res.end();
            return;
        }

        let extension = q.pathname.split(".")[1];
        let contentType = "";
        if (extension == "html" || extension == "css" || extension == "js") {
            contentType = "text/" + extension;
        } else if (extension == "png" || extension == "ico" || extension == "jpeg") {
            contentType = "img/" + extension;
        }
        res.writeHead(200, {"Content-Type": contentType});
        res.end(data);
    })
    
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');
