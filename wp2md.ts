#!/usr/bin/env node

var DEBUG: boolean = true

// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
import * as fs from "fs"
import * as URL from "url";
import * as toMarkdown from "to-markdown"
import * as YAML from "json2yaml"
import * as yargs from "yargs"

/**
 * Interface for the frontmatter object/json
 *  generated with http://json2ts.com/
 */
declare module WordpressNamespace {

    export interface WordpressTaxonomy {
        type ? : string;
        nice_name ? : string;
        name ? : string;
    }

    export interface WordpressItem {
        title ? : string;
        link ? : string;
        permalink ? : string; // # we will generate this from the link
        creator ? : string;
        post_id ? : number;
        post_date ? : string;
        comment_status ? : string;
        post_name ? : string;
        status ? : string;
        post_type ? : string;
        post_parent ? : number;
        is_sticky ? : number;
        excerpt ? : string;
        content ? : string;
        taxonomies ? : WordpressTaxonomy[];
        categories ? : string[];
        tags ? : string[];
    }

}

/**
 * XML elements to save
 */
let WHAT2SAVE: object = {
    'channel': [
        'title',
        'description',
        'author_display_name',
        'author_login',
        'author_email',
        'base_site_url',
        'base_blog_url',
        'export_date', //# Generated: data export timestamp
        'content', //# Generated: items list
        // # 'link',
        // # 'language',
    ],
    'item': [
        'title',
        'link',
        'category', //# we want multiple <category domain="post_tag"
        'comments', //# Generated: comments list
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
        // 'description', // seems to always be empty 
        // # 'guid',
        // # 'menu_order',
        // # 'ping_status',
        // # 'post_password',
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
        // # 'comment_parent',
        // # 'comment_user_id',
    ],
}

/**
 * 
 */
class wpParser {


    // Wordpress RSS items to public - static page header fields mapping
    //(undefined names will remain unchanged)
    FIELD_MAP = {
        'creator': 'author',
        'post_date': 'created',
        'post_date_gmt': 'created_gmt',
    }

    constructor(private xmlFile: string) {

    }

    convertTaxonomy(taxonomy: WordpressNamespace.WordpressTaxonomy,
        typeofTaxonomy: string = "category"): string[] {
        if (DEBUG) console.log("Converting: " + typeofTaxonomy)

        var converted = []
        Array.prototype.filter.call(taxonomy, (t) => {
            if (t.type === typeofTaxonomy) {
                converted.push(t.nice_name)
                return true
            }
        })
        if (DEBUG) console.log(converted)
        if (converted.length === 0)
            return undefined
        else
            return converted
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
    stripWPPrefix(tag: string) {
        let splitTag = tag.split(':')
        if (splitTag[0] == "wp" || splitTag[0] == "dc") {
            //  starts with wp: or dc: e.g. dc:creator
            return splitTag[1]
        } else if (splitTag[1] == "encoded") {
            // ends with :encoded e.g. content:encoded
            return splitTag[0]
        } else {
            // all other cases return original
            return tag
        }
    }

    /**
     * the function that parses the Wordpress XML export file
     * and outputs to json
     */
    parse2js() {

        // https://github.com/Leonidas-from-XIV/node-xml2js
        let parseString = require('xml2js').parseString

        parseString(this.xmlFile, {
                tagNameProcessors: [this.stripWPPrefix]
            },
            (err, result) => {
                var items: string[] = []
                var item: WordpressNamespace.WordpressItem

                var channels = Object.keys(result["rss"]["channel"]).length
                if (DEBUG) console.log("Number of channels: " + channels)
                if (channels > 1) {
                    console.log("More than one channel is currently not supported")
                    return false
                }

                var numberOfItems = Object.keys(result["rss"]["channel"][0]["item"]).length
                if (DEBUG) console.log("Number of items: " + numberOfItems)

                for (let xmlitem of result["rss"]["channel"][0]["item"]) {
                    item = {}
                    item.taxonomies = []

                    for (let i of WHAT2SAVE['item']) {

                        if (xmlitem[i]) {
                            if (DEBUG) console.log("Processing: " + i)
                            if (i === "category") {
                                item.taxonomies = xmlitem[i].map((current_tag) => {
                                    return <WordpressNamespace.WordpressTaxonomy > {
                                        type: current_tag.$.domain,
                                        name: current_tag._,
                                        nice_name: current_tag.$.nicename
                                    }
                                })
                            } else if (i === "content") {
                                if (DEBUG)
                                    item.content = "<h1>Debug</h1>Cleared for better <strong>readability</strong>"
                                else
                                    item.content = toMarkdown(xmlitem[i][0])

                            } else if (i === "link") {
                                item[i] = xmlitem[i][0]
                                item.permalink = URL.parse(item.link).pathname
                            } else {
                                item[i] = xmlitem[i][0]
                            }
                        }
                    }

                    // Sort function syntax via
                    // https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
                    // added custom sort function
                    item = Object.keys(item).sort((n1, n2) => {
                        let sortOrder = {
                            title: 0,
                            post_name: 1,
                            post_id: 2,
                            link: 3,
                            creator: 4,
                            post_date: 5,
                            post_type: 6,
                            status: 7,
                            commerent_status: 8,
                            post_parent: 9,
                            is_sticky: 10,
                            excerpt: 11,
                            taxonomies: 12,
                            content: 13,
                        }
                        return sortOrder[n1] - sortOrder[n2]
                    }).reduce((r, k) => (r[k] = item[k], r), {})

                    item.categories = this.convertTaxonomy(item.taxonomies)
                    item.tags = this.convertTaxonomy(item.taxonomies, "post_tag")

                    // content moved to its own variable, away from frontmatter
                    let content = item.content
                    delete item.content

                    // let markdownItem: string
                    items.push(YAML.stringify(item) + "---\n" + toMarkdown(content))

                    // if (DEBUG) console.log(markdownItem)
                    // if (DEBUG) console.log(item.permalink)
                } // end xmlitem loop
                if (DEBUG) console.dir(items)
            });
    }
}
let cmdArgs = yargs.
option('file', {
    alias: "f",
    describe: 'the xml file output from WordPress'
}).
option('output', {
    alias: "o",
    describe: 'default directory name: "filename" without extension'
}).
usage("Usage: $0 -f [filename.xml]").
demandOption(['f']).
help().
argv


let outDir = cmdArgs.output
if (outDir === undefined) {
    outDir = cmdArgs.file.replace(/\.[^/.]+$/, "")
    if (DEBUG) console.log("Ouput Dir: " + outDir)
}

if (DEBUG) console.log("Filename: " + cmdArgs.file)
fs.stat(cmdArgs.file, (err, stats) => {
    if (err != null) {
        console.log("Trying to open file \"" + cmdArgs.file + "\" gave error: " + err)
    } else {
        // let xmlFile = fs.readFileSync(cmdArgs.file, 'utf8')
        // let parser = new wpParser(xmlFile)
        // parser.parse2js()

        fs.readFile(cmdArgs.file, 'utf8', (err, data) => {
            let parser = new wpParser(data)
            parser.parse2js()
        })
    }

})