var DEBUG: boolean = true

// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
import * as fs from "fs"
import * as toMarkdown from "to-markdown"
import * as YAML from "json2yaml"

/**
 * Interface for the frontmatter object/json
 *  generated with http://json2ts.com/
 */
declare module WpNamespace {

    export interface wpTaxonomy {
        type ? : string;
        nice_name ? : string;
        name ? : string;
    }

    export interface wpItem {
        title ? : string;
        link ? : string;
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
        taxonomies ? : wpTaxonomy[];
    }

}

class wpParser {

    /**
     * XML elements to save
     */
    WHAT2SAVE: object = {
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

    // Wordpress RSS items to public - static page header fields mapping
    //(undefined names will remain unchanged)
    FIELD_MAP = {
        'creator': 'author',
        'post_date': 'created',
        'post_date_gmt': 'created_gmt',
    }

    constructor(private xmlFile: string) {

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
                var item: WpNamespace.wpItem = {}
                item.taxonomies = []

                for (let i of parser.WHAT2SAVE['item']) {
                    // for (let i of ["category"]) {
                    // only if not undefined, as some elements may not exist on all items
                    if (result["rss"]["channel"][0]["item"][0][i]) {
                        // console.log("Processing: " + i)
                        if (i === "category") {
                            item.taxonomies = result["rss"]["channel"][0]["item"][0][i].map((current_tag) => {
                                return <WpNamespace.wpTaxonomy > {
                                    type: current_tag.$.domain,
                                    name: current_tag._,
                                    nice_name: current_tag.$.nicename
                                }
                            })
                        } else if (i === "content") {
                            item.content = toMarkdown(result["rss"]["channel"][0]["item"][0][i][0])

                        } else {
                            item[i] = result["rss"]["channel"][0]["item"][0][i][0]
                        }
                    }
                }

                if (DEBUG) item.content = "<h1>Debug</h1>Cleared for better <strong>readability</strong>"

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
                        comment_status: 8,
                        post_parent: 9,
                        is_sticky: 10,
                        excerpt: 11,
                        taxonomies: 12,
                        content: 13
                    }
                    return sortOrder[n1] - sortOrder[n2]
                }).reduce((r, k) => (r[k] = item[k], r), {})

                if (DEBUG) console.log(YAML.stringify(item))
            });
    }
}

let xmlFile = fs.readFileSync('test.xml', 'utf8')
let parser = new wpParser(xmlFile)

parser.parse2js()