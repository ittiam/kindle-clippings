var fs = require('fs');

function isObject(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
}

function extend(obj) {
    if(!isObject(obj)) return obj;
    var source, prop;
    for(var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for(prop in source) {
            obj[prop] = source[prop];
        }
    }

    return obj;
}

var helper = {
    split_created: function(text) {
        var re = /#(\d+\-?\d+)\s*的(.*)\s+\|\s+添加于\s+(\d{4})年(\d+)月(\d+)日.*(上|下)午(\d+):(\d+):(\d+)$/,
            match = re.exec(text);

        var m7 = +match[7];

        var hours = match[6] === '上' ? m7 : (m7 + 12) === 24 ? 0 : m7 + 12,
            minutes = match[8],
            seconds = match[9];

        return {
            position: match[1],
            type: match[2],
            date: new Date(match[3] + ' ' + match[4] + ' ' + match[5] + ' ' + hours + ':' + minutes + ':' + seconds)
        };
    },
    split_book: function(text) {
        var re = /(.+)\((.+)\)/,
            match = re.exec(text);

        return {
            book: match[1].trim(),
            author: match[2].trim()
        };
    }
};

function Block(texts) {
    this.type = ''; // '标注'，'书签'
    this.position = '';
    this.book = '';
    this.author = '';
    this.date = null;
    this.content = '';
    this.texts = texts;

    this.init();
}

Block.prototype.init = function() {
    var para_arr = this.texts.split('\r\n');

    var data = null;

    data = helper.split_book(para_arr[0]);
    extend(this, data);

    if(para_arr[1]) {
        data = helper.split_created(para_arr[1]);
        extend(this, data);
    }

    this.content = para_arr[3];

    data = null;
};

function parse_blocks(paragraphs) {

    paragraphs = paragraphs.split('==========');

    var blocks = paragraphs.map(parse_block);

    return blocks;
}

function parse_block(texts) {
    texts = texts.trim();

    if(!texts) return null;

    return new Block(texts);
}

function read_file(path, callback) {
    fs.readFile(path, function(err, data) {
        if(err) throw err;

        callback(data.toString());
    });
}

function kindle_clippings(path) {
    read_file(path, parse_blocks);
}

kindle_clippings('./My Clippings.txt');

