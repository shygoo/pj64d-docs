// npm install yaml
// node build [unstable]

const yaml = require('yaml');
const fs = require('fs');
const process = require('process');

const UNSTABLE_BUILD = process.argv[2] == 'unstable';
const DOC_NAME = "JS-API-Documentation"
const DOC_OUTPUT_PATH = UNSTABLE_BUILD ? (DOC_NAME+"-unstable.html") : (DOC_NAME+".html");

const DATE = new Date();

var DOC_VERSION_NUMS = [
    DATE.getFullYear().toString(),
    (DATE.getMonth()+1).toString().padStart(2, '0'),
    DATE.getDate().toString().padStart(2, '0')
];

var DOC_VERSION =
    (UNSTABLE_BUILD ? "unstable " : "") +
    DOC_VERSION_NUMS.join('.');

const CSS_PATH = __dirname + '/docstyle.inc.css';
const YAML_PATH = __dirname + '/documentation.yaml';
const JS_PATH = __dirname + '/docscript.inc.js';

var CSS_SOURCE = fs.readFileSync(CSS_PATH).toString();
var YAML_SOURCE = fs.readFileSync(YAML_PATH).toString();
var JS_SOURCE = fs.readFileSync(JS_PATH).toString();

function docfmt(text) {
    return text.trim()
               .replace(/```([\w\W]+?)```/g, jsfmt)
               .replace(/`(.+?)`/g, `<span class="snip">$1</span>`)
               .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, `<a target="blank" href=\"$2\">$1</a>`)
               .replace(/\[(.+?)\]\((.+?)\)/g, `<a href=\"$2\">$1</a>`)
               .replace(/\{embed_img\:(.+?)\}/g, embed_img);

    function embed_img(m) {
        var path = m.match(/{embed_img\:(.+)}/)[1];
        var base64 = fs.readFileSync(__dirname + '/' + path, {encoding: 'base64'});
        return `<img src="data:image/png;base64,${base64}">`;
    }
}

function jsfmt(text) {
    const jsKeyWords = [
        'const', 'var', 'new', 'switch', 'case', 'break', 'default',
        'if', 'else', 'try', 'catch', 'for', 'while', 'true', 'false',
        'null', 'undefined', 'function', 'this', 'return', 'typeof'
    ];

    text = text.replace(/```([\w\W]+?)```/, '$1');

    var formatted = "";

    for(var i = 0; i < text.length;) {
        var anchor = i;
        if(/[a-zA-Z]/.test(text[i])) { // word
            i++;
            while(i < text.length && /[a-zA-Z_\d]/.test(text[i])) i++;
            var word = text.slice(anchor, i);
            formatted += jsKeyWords.indexOf(word) >= 0 ? `<span class="js-keyword">${word}</span>` : `<span class="js-word">${word}</span>`;
        }
        else if(text[i] == '"' || text[i] == "'") { // str literal
            var q = text[i]
            // don't need \ for now
            i++;
            while(text[i] != q) i++;
            i++;
            formatted += `<span class="js-string">${text.slice(anchor, i)}</span>`;
        }
        else if(text[i] == '/' && text[i+1] == '/') { // line comment
            i += 2;
            while(i < text.length && text[i] != '\n') i++;
            formatted += `<span class="js-comment">${text.slice(anchor, i)}</span>`
        }
        else if(text[i] == '/' && text[i+1] == '*') { // block comment
            i += 2;
            while(i < text.length && !(text[i] == '*' && text[i+1] == '/')) i++;
            i += 2;
            formatted += `<span class="js-comment">${text.slice(anchor, i)}</span>`
        }
        else if(/[\d]/.test(text[i])) { // number
            i++;
            while(i < text.length && /[a-zA-Z_\d]/.test(text[i])) i++;
            formatted += `<span class="js-number">${text.slice(anchor, i)}</span>`;
        }
        else { //whitespace, operators etc.
            formatted += text[i++];
        }
    }

    return `<pre class="ex">${formatted}</pre>`;
}

function idfmt(text) {
    return text.replace(/\./g, "_");
}

var content = '';
var modlinks = '';

var mods = yaml.parse(YAML_SOURCE);

mods.forEach(mod => {
    var propLinks = ''
    var propsContent = '';

    if(mod) {
        if(!UNSTABLE_BUILD && mod.UNSTABLE) {
            return;
        }

        mod.props.forEach(prop => {
            if(!UNSTABLE_BUILD && prop.UNSTABLE) {
                return;
            }

            var linkClass = (mod.UNSTABLE || prop.UNSTABLE) ? "unstable" : "";
            propLinks += `<li><a class="${linkClass}" href="#${idfmt(prop.name)}">${prop.js}</a></li>\n`;
    
            var propTags = '';
            
            if(prop.tags)
            propTags = prop.tags.map((tag) => {
                return `<div class="tag ${tag[1]}">${tag[0]}</div>`
            }).join('');
    
            if(prop.UNSTABLE || mod.UNSTABLE) {
                propTags += `<div class="tag red">Unstable</div>`;
            }

            propsContent += (
                `<!-- ${prop.name} -->\n` +
                `<p>` +
                `<div class="prop"><span class="title" id="${idfmt(prop.name)}">${prop.js}</span>${propTags}</div>\n` +
                (prop.js2 ? `<div><span class="title2">${prop.js2}</span></div>`: '') +
                (prop.ts ? `<div class="tsproto">${prop.ts}</div>\n` : '') +
                `</p>\n` +
                docfmt(prop.desc) + `\n`
            );
        });
    }

    var linkClass = mod.UNSTABLE ? "unstable" : "";
    var modTags = "";
    if(mod.UNSTABLE) {
        modTags += `<div class="tag red">Unstable</div>`;
    }

    modlinks += `<p><li><a class="${linkClass}" href="#${idfmt(mod.name)}">${mod.name}</a>${mod.tagline ? `: ${mod.tagline}` : ''}${propLinks!=''?`<ul>\n${propLinks}</ul>`:''}</li></p>\n`;

    content += (
        `<!-- ${mod.name} -->\n` +
        `<div class="module">\n` +
        `<div class="modtitle"><span class="title" id="${idfmt(mod.name)}">${mod.name}</span>${modTags}</div>\n` +
        (mod.desc ? `${docfmt(mod.desc)}\n` :
         mod.tagline ? `${docfmt(mod.tagline)}\n`: '') +
        `${propsContent}\n` +
        `</div>\n`
    );
});

CSS_SOURCE = CSS_SOURCE.trim();
modlinks = modlinks.trim();
content = content.trim();

var html = (`<!DOCTYPE html>
<!-- Generated ${(new Date()).toDateString().match(/.+? (.+?)$/)[1]} -->
<!-- YAML source: https://github.com/shygoo/pj64d-docs -->
<head>
<title>Project64 JavaScript API ${DOC_VERSION}</title>
<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,700,700italic' rel='stylesheet' type='text/css'>
<style>
${CSS_SOURCE}
</style>
<script>
${JS_SOURCE}
</script>
</head>
<body>
<div class="sidebar">
<div class="sidebar-content">
<div class="pagetitle">Project64 JavaScript API</div>
${DOC_VERSION}
<hr>
<ul>
${modlinks}
</ul>
<hr>
<label style="font-size: 12px; vertical-align: middle; user-select: none;">
    <input id="darkmode-toggle" type="checkbox" style="vertical-align: bottom; margin-right: 5px;"/>
    Dark theme
</label>
</div>
</div>
<div class="content">
${content}
</div>
</body>
`);

fs.writeFileSync(DOC_OUTPUT_PATH, html);
console.log(DOC_OUTPUT_PATH + " created");
