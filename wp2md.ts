// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
import * as fs from "fs"


class wpParser {

    // # XML elements to save (starred ones are additional fields
    // # generated during export data processing)
    WHAT2SAVE = {
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
            'dc:creator',
            'description',
            'post_id',
            'post_date_gmt',
            'comment_status',
            'post_name',
            'status',
            'post_type',
            'excerpt',
            'content', //# Generated: item content
            'comments', //# Generated: comments list
            'category', //# we want multiple <category domain="post_tag"
            // # 'guid',
            // # 'is_sticky',
            // # 'menu_order',
            // # 'ping_status',
            // # 'post_parent',
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
        ]
    }

    // # Wordpress RSS items to public - static page header fields mapping#(undefined names will remain unchanged)
    FIELD_MAP = {
        'creator': 'author',
        'post_date': 'created',
        'post_date_gmt': 'created_gmt',
    }

    constructor(private xmlFile: string) {

    }

    // Categories and Tags look like this:
    //
    // result["rss"]["channel"][0]["item"][0]["category"]
    //
    // [ { _: 'Blog', '$': { domain: 'category', nicename: 'blog' } },
    //   { _: 'Ernährung',
    //     '$': { domain: 'category', nicename: 'ernaehrung' } },
    //   { _: 'Fett', '$': { domain: 'post_tag', nicename: 'fett' } },
    //   { _: 'Omega-6 Fett',
    //     '$': { domain: 'post_tag', nicename: 'omega-6' } } ]
    parse2js() {
        /**
         * the function that parses the Wordpress XML export file
         * and outputs to json
         */

        let parseString = require('xml2js').parseString;
        // https://github.com/Leonidas-from-XIV/node-xml2js
        parseString(this.xmlFile, function (err, result) {
            console.dir(

                result["rss"]["channel"][0]["item"][0]["dc:creator"]
            )
            //  meta data category, tags
            // console.dir(
            //     (result["rss"]["channel"][0]["item"][0]["category"])
            // )
        });
    }

}

let xmlFile = fs.readFileSync('test.xml', 'utf8')
let parser = new wpParser(xmlFile)

parser.parse2js()