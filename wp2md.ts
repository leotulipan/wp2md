// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
import * as fs from "fs"
import * as toMarkdown from "to-markdown"

class wpParser {

    // # XML elements to save (starred ones are additional fields
    // # generated during export data processing)

    // let w: object = {
    // channel: ['title', 'description'],
    // item: ['post_id', 'post_name'],
    // }
    // console.dir(w['item'])


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
            'post_date_gmt',
            'comment_status',
            'post_name',
            'status',
            'post_type',
            'post_parent',
            'is_sticky',
            'excerpt',
            'content', //# Generated: item content          
            // 'dc:creator',
            // 'wp:post_id',
            // 'wp:post_date_gmt',
            // 'wp:comment_status',
            // 'wp:post_name',
            // 'wp:status',
            // 'wp:post_type',
            // 'wp:post_parent',
            // 'wp:is_sticky',
            // 'excerpt:encoded',
            // 'content:encoded', //# Generated: item content
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

    // # Wordpress RSS items to public - static page header fields mapping#(undefined names will remain unchanged)
    FIELD_MAP = {
        'creator': 'author',
        'post_date': 'created',
        'post_date_gmt': 'created_gmt',
    }

    constructor(private xmlFile: string) {

    }

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

    parse2js() {
        /**
         * the function that parses the Wordpress XML export file
         * and outputs to json
         */

        // https://github.com/Leonidas-from-XIV/node-xml2js
        let parseString = require('xml2js').parseString

        // let processors = require('xml2js/lib/processors')
        // we are not using strpPrefix b/c content:encoded and excerpt:encoded would yield
        // "encoded"
        // tagNameProcessors: [processors.stripPrefix],

        parseString(this.xmlFile, {
                tagNameProcessors: [this.stripWPPrefix]
            },
            (err, result) => {
                var item: Array < any > = []
                for (let i of parser.WHAT2SAVE['item']) {
                    // for (let i of ["category"]) {
                    // only if not undefined, as some elements may not exist on all items
                    if (result["rss"]["channel"][0]["item"][0][i]) {
                        // console.log("Processing: " + i)
                        if (i === "category") {
                            item.push(result["rss"]["channel"][0]["item"][0][i].map((value) => {
                                return {
                                    [value['$']['domain']]: value['$']['nicename'],
                                    name: value['_'],
                                }
                            }))
                        } else if (i === "content") {
                            item.push({
                                [i]: toMarkdown(result["rss"]["channel"][0]["item"][0][i][0])
                            })
                        } else {
                            item.push({
                                [i]: result["rss"]["channel"][0]["item"][0][i][0]
                            })
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
                console.dir(item)
                //console.dir(result["rss"]["channel"][0]["item"][0])
            });
    }

}

let xmlFile = fs.readFileSync('test.xml', 'utf8')
let parser = new wpParser(xmlFile)

parser.parse2js()