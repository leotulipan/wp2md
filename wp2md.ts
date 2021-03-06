#!/usr/bin/env node

// https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-ms-code-with-typescript
// npm install "@types/node" --save-dev
import * as fs from "fs"
import * as URL from "url";
import * as toMarkdown from "to-markdown"
import * as YAML from "json2yaml"
import * as yargs from "yargs"

// DEBUG mode if DEBUG = true you get additional console.log output
var DEBUG: boolean = false

/**
 * Interface for the frontmatter object/json
 *  generated with http://json2ts.com/
 */
declare module WordpressNamespace {

  /**
   * 
   * 
   * @export
   * @interface WordpressTaxonomy
   */
  export interface WordpressTaxonomy {
    type?: string;
    nice_name?: string;
    name?: string;
  }

  /**
   * 
   * 
   * @export
   * @interface WordpressItem
   */
  export interface WordpressItem {
    title?: string;
    link?: string;
    permalink?: string; // # we will generate this from the link
    creator?: string;
    post_id?: number;
    post_date?: string;
    comment_status?: string;
    post_name?: string;
    status?: string;
    post_type?: string;
    post_parent?: number;
    is_sticky?: number;
    excerpt?: string;
    content?: string;
    taxonomies?: WordpressTaxonomy[];
    categories?: string[];
    tags?: string[];
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
 * 
 * @class wpParser
 */
export class wpParser {

  // Refactor with interface next:
  //  array setter/getter for array
  // https://stackoverflow.com/questions/25469244/how-can-i-define-an-interface-for-an-array-of-objects-with-typescript
  // https://visualstudiomagazine.com/articles/2016/01/01/exploiting-typescript-arrays.aspx
  private _items: Array<WordpressNamespace.WordpressItem>;

  get items(): Array<WordpressNamespace.WordpressItem> {
    return this._items
  }

  set items(value) {
    this._items = value
  }

  public addItem(singleItem) {
    this._items.push(singleItem)
  }

  public getItem(index) {
    return this._items[index]
  }

  public getItemLength() {
    return this._items.length
  }

  // Wordpress RSS items to public - static page header fields mapping
  //(undefined names will remain unchanged)
  FIELD_MAP = {
    'creator': 'author',
    'post_date': 'created',
    'post_date_gmt': 'created_gmt',
  }

  constructor(private xmlFile: string) {
    this._items = []
  }

  convertTaxonomy(taxonomy: WordpressNamespace.WordpressTaxonomy[],
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

  item2YAML(item: WordpressNamespace.WordpressItem) {

    // content moved to its own variable, away from frontmatter
    let content = item.content
    delete item.content

    return YAML.stringify(item) + "---\n" +
      toMarkdown(content)
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

        var item: WordpressNamespace.WordpressItem

        var channels = Object.keys(result["rss"]["channel"]).length
        if (DEBUG) console.log("Number of channels: " + channels)
        if (channels > 1) {
          console.log(
            "More than one channel is currently not supported")
          return false
        }

        var numberOfItems = Object.keys(result["rss"]["channel"][
          0]["item"]).length
        if (DEBUG) console.log("Number of items: " + numberOfItems)

        for (let xmlitem of result["rss"]["channel"][0]["item"]) {
          item = {}
          item.taxonomies = []

          for (let i of WHAT2SAVE['item']) {

            if (xmlitem[i]) {
              // if(DEBUG) console.log("Processing: " + i)
              if (i === "category") {
                item.taxonomies = xmlitem[i].map((current_tag) => {
                  return <WordpressNamespace.WordpressTaxonomy>
                    {
                      type: current_tag.$.domain,
                      name: current_tag._,
                      nice_name: current_tag.$.nicename
                    }
                })
              } else if (i === "content") {
                if (DEBUG)
                  item.content =
                    "<h1>Debug</h1>Cleared for better <strong>readability</strong>"
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
          item.tags = this.convertTaxonomy(item.taxonomies,
            "post_tag")

          this.addItem(item)

        } // end xmlitem loop  
        if (DEBUG) console.log("No. of items: " + this.getItemLength())
      });
  }
}

/**
 * 
 * 
 * @param {string} filename 
 * @param {string} content 
 */
function saveFile(filename: string, content: string) {
  // options <Object> | <string>
  // encoding <string> | <null> Default: 'utf8'
  // mode <integer> Default: 0o666
  // flag <string> Default: 'w'
  fs.writeFile(filename, content, err => {
    if (err) throw err;
    if (DEBUG) console.log("saved file: " + filename)
  })

}

/**
 * Get Channel data => index.md
 * based on "def dump_channel" in the python module 
 *  line 464 wp2md.py
 */
function saveChannelData(directory, parser: wpParser) {
  let index = "index content"
  let content: String
  // def dump_channel(meta, items):
  // """Dumps RSS channel metadata and items index."""
  // file_name = get_path('page', 'index.md')
  // log.info("Dumping index to '%s'" % file_name)
  // fields = WHAT2SAVE['channel']
  // let WHAT2SAVE: object = {
  //   'channel': [
  //         'title',
  //         'description',
  //         'author_display_name',
  //         'author_login',
  //         'author_email', // wp:author_email - CDATA
  //         'base_site_url',
  //         'base_blog_url',  // wp:base_blog_url
  //         'export_date', //# Generated: data export timestamp
  //         'content', //# Generated: items list
  // meta = {field: meta.get(field, None) for field in fields}

  // # Append export_date
  // pub_date = meta.get('pubDate', None)
  // format = conf['parse_date_fmt']
  // meta['export_date'] = parse_date(pub_date, format, time.gmtime())

  // # Append table of contents
  // meta['content'] = generate_toc(meta, items)

  for (let item of parser.items) {
    let stringItem = parser.item2YAML(
      item)
    saveFile(directory + "/" + item.post_name +
      ".md", stringItem)
    content = content + "\n[" + item.title + "](" + item.post_name +
      ".md)"
  }

  fs.writeFile(directory + "/index.md", index + content, err => {
    if (err) throw err;
    if (DEBUG) console.log("saved channel index.md file")
  })
}

/**
 * Main
 */
function main() {
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
      console.log("Trying to open file \"" + cmdArgs.file +
        "\" gave error: " + err)
    } else {
      fs.readFile(cmdArgs.file, 'utf8', (err, data) => {

        let parser = new wpParser(data)
        parser.parse2js()

        // if(DEBUG) console.log("First Item: Character Lenght")
        //  HOW TO CAST AS STRING TO GET THE LENGTH?
        //  if(DEBUG) console.dir( String.prototype.length.call(parser.item2YAML(parser.getItem(0)) ) 

        fs.mkdir(outDir, (err) => {
          fs.access(outDir, fs.constants.W_OK, (err) => {
            if (err) throw err;

            saveChannelData(outDir, parser)

            // Access items with parser.getItem and parser.getItemLength

          }
          })
      })
    })
}

})

}

main()
