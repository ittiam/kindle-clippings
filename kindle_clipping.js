var fs = require('fs');

var helper = {
    split_created: function(text) {
        var re = /#(\d+\-?\d+)\s*的(.*)\s+\|\s+添加于\s+(\d{4})年(\d{2})月(\d{2})日.*(上|下)午(\d{2}):(\d{2}):(\d{2})$/,
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

    data = helper.split_bool(para_arr[0]);
    this.author = data.author;
    this.book = data.book;

    this.content = para_arr[3];


    if(para_arr[1]) {
        data = helper.split_created(para_arr[1]);
        this.position = data.position;
        this.type = data.type;
        this.date = data.date;
    }

    data = null;
};

function parse_blocks(paragraphs) {

    paragraphs = paragraphs.split('==========');

    return paragraphs.map(parse_block);
}

function parse_block(texts) {
    texts = texts.trim();

    var block = new Block(texts);

    return block;
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

