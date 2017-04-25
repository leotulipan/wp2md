// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
import * as fs from "fs"

let xml = fs.readFileSync('test.xml', 'utf8')

let parseString = require('xml2js').parseString;


// https://github.com/Leonidas-from-XIV/node-xml2js
parseString(xml, function (err, result) {
    console.dir(
        (result["rss"]["channel"][0]["item"][0]["category"])
    )
});