"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
var fs = require("fs");
var toMarkdown = require("to-markdown");
/**
 *
  Returns an ordered Json stringified
 via https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
*/
function orderedItemJsonStringify(o) {
    return JSON.stringify(Object.keys(o).sort(function (n1, n2) {
        var sortOrder = {
            title: 0,
            post_name: 1,
            post_id: 2,
            link: 3,
            creator: 4,
            post_date: 5,
            post_type: 6,
            status: 7,
            comment_status: 8,
            post_parent: 9,
            is_sticky: 10,
            excerpt: 11,
            taxonomies: 12,
            content: 13
        };
        return sortOrder[n1] - sortOrder[n2];
    }).reduce(function (r, k) { return (r[k] = o[k], r); }, {}));
}
var wpParser = (function () {
    function wpParser(xmlFile) {
        this.xmlFile = xmlFile;
        // # XML elements to save (starred ones are additional fields
        // # generated during export data processing)
        // let w: object = {
        // channel: ['title', 'description'],
        // item: ['post_id', 'post_name'],
        // }
        // console.dir(w['item'])
        this.WHAT2SAVE = {
            'channel': [
                'title',
                'description',
                'author_display_name',
                'author_login',
                'author_email',
                'base_site_url',
                'base_blog_url',
                'export_date',
                'content',
            ],
            'item': [
                'title',
                'link',
                'category',
                'comments',
                'creator',
                'post_id',
                'post_date',
                'comment_status',
                'post_name',
                'status',
                'post_type',
                'post_parent',
                'is_sticky',
                'excerpt',
                'content',
            ],
            'comment': [
                'comment_id',
                'comment_author',
                'comment_author_email',
                'comment_author_url',
                'comment_author_IP',
                'comment_date',
                'comment_date_gmt',
                'comment_content',
                'comment_approved',
                'comment_type',
            ],
        };
        // # Wordpress RSS items to public - static page header fields mapping#(undefined names will remain unchanged)
        this.FIELD_MAP = {
            'creator': 'author',
            'post_date': 'created',
            'post_date_gmt': 'created_gmt',
        };
    }
    wpParser.prototype.stripWPPrefix = function (tag) {
        var splitTag = tag.split(':');
        if (splitTag[0] == "wp" || splitTag[0] == "dc") {
            //  starts with wp: or dc: e.g. dc:creator
            return splitTag[1];
        }
        else if (splitTag[1] == "encoded") {
            // ends with :encoded e.g. content:encoded
            return splitTag[0];
        }
        else {
            // all other cases return original
            return tag;
        }
    };
    wpParser.prototype.parse2js = function () {
        /**
         * the function that parses the Wordpress XML export file
         * and outputs to json
         */
        // https://github.com/Leonidas-from-XIV/node-xml2js
        var parseString = require('xml2js').parseString;
        // let processors = require('xml2js/lib/processors')
        // we are not using strpPrefix b/c content:encoded and excerpt:encoded would yield
        // "encoded"
        // tagNameProcessors: [processors.stripPrefix],
        parseString(this.xmlFile, {
            tagNameProcessors: [this.stripWPPrefix]
        }, function (err, result) {
            var item = {};
            item.taxonomies = [];
            for (var _i = 0, _a = parser.WHAT2SAVE['item']; _i < _a.length; _i++) {
                var i = _a[_i];
                // for (let i of ["category"]) {
                // only if not undefined, as some elements may not exist on all items
                if (result["rss"]["channel"][0]["item"][0][i]) {
                    // console.log("Processing: " + i)
                    if (i === "category") {
                        item.taxonomies = result["rss"]["channel"][0]["item"][0][i].map(function (current_tag) {
                            return {
                                type: current_tag.$.domain,
                                name: current_tag._,
                                nice_name: current_tag.$.nicename
                            };
                        });
                    }
                    else if (i === "content") {
                        item.content = toMarkdown(result["rss"]["channel"][0]["item"][0][i][0]);
                    }
                    else {
                        item[i] = result["rss"]["channel"][0]["item"][0][i][0];
                    }
                }
            }
            // [ { title: 'Margarineproduzenten geben auf: Butter ist gesünder' },
            //   { link: 'https://paleolowcarb.de/margarineproduzenten-geben-auf-butter-ist-gesuender/' },
            //   { creator: 'leonard' },
            //   { description: '' },
            //   { post_id: '548' },
            //   { post_date_gmt: '2014-02-09 08:00:27' },
            //   { comment_status: 'closed' },
            //   { post_name: 'margarineproduzenten-geben-auf-butter-ist-gesuender' },
            //   { status: 'publish' },
            //   { post_type: 'post' },
            //   [ { category: 'blog', name: 'Blog' },
            //     { category: 'ernaehrung', name: 'Ernährung' },
            //     { post_tag: 'fett', name: 'Fett' },
            //     { post_tag: 'omega-6', name: 'Omega-6 Fett' } ] ]
            item.content = "Cleared for debug purposes";
            // console.dir(JSON.stringify(item))
            console.dir(orderedItemJsonStringify(item));
        });
    };
    return wpParser;
}());
var xmlFile = fs.readFileSync('test.xml', 'utf8');
var parser = new wpParser(xmlFile);
parser.parse2js();
//# sourceMappingURL=wp2md.js.map