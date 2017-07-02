"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEBUG = true;
// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
var fs = require("fs");
var toMarkdown = require("to-markdown");
var YAML = require("json2yaml");
var wpParser = (function () {
    function wpParser(xmlFile) {
        this.xmlFile = xmlFile;
        /**
         * XML elements to save
         */
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
        // Wordpress RSS items to public - static page header fields mapping
        //(undefined names will remain unchanged)
        this.FIELD_MAP = {
            'creator': 'author',
            'post_date': 'created',
            'post_date_gmt': 'created_gmt',
        };
    }
    /**
     * removes prefix or postfix
     * prefixes: wp: or dc:
     * postfix: :encoded
     * planned on using stripPrefix, but it doesn't handle postfix
     *  // let processors = require('xml2js/lib/processors')
     *  // tagNameProcessors: [processors.stripPrefix]
     * @param tag the xml tag that needs to be parsed
     */
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
    /**
     * the function that parses the Wordpress XML export file
     * and outputs to json
     */
    wpParser.prototype.parse2js = function () {
        // https://github.com/Leonidas-from-XIV/node-xml2js
        var parseString = require('xml2js').parseString;
        parseString(this.xmlFile, {
            tagNameProcessors: [this.stripWPPrefix]
        }, function (err, result) {
            var item = {};
            item.taxonomies = [];
            for (var _i = 0, _a = parser.WHAT2SAVE['item']; _i < _a.length; _i++) {
                var i = _a[_i];
                if (result["rss"]["channel"][0]["item"][0][i]) {
                    if (DEBUG)
                        console.log("Processing: " + i);
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
            // if (DEBUG) item.content = "<h1>Debug</h1>Cleared for better <strong>readability</strong>"
            // Sort function syntax via
            // https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
            // added custom sort function
            item = Object.keys(item).sort(function (n1, n2) {
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
            }).reduce(function (r, k) { return (r[k] = item[k], r); }, {});
            var content = item.content;
            delete item.content;
            var markdownItem;
            markdownItem = YAML.stringify(item);
            markdownItem += "---\n";
            markdownItem += toMarkdown(content);
            if (DEBUG)
                console.log(markdownItem);
        });
    };
    return wpParser;
}());
var xmlFile = fs.readFileSync('test.xml', 'utf8');
var parser = new wpParser(xmlFile);
parser.parse2js();
//# sourceMappingURL=wp2md.js.map