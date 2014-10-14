var fs = require('fs');

var helper = {
    split_text: function(text) {
        var re = /#(\d+\-?\d+)\s*的(.*)\s+\|\s+添加于\s+(\d+)年(\d+)月(\d+)日.*(上|下)午(\d+):(\d+):(\d+)$/,
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
    }
};

function Block(texts) {
    this.type = ''; // '标注'，'书签'
    this.position = '';
    this.title = '';
    this.date = null;
    this.content = '';
    this.texts = texts;

    this.init();
}

Block.prototype.init = function() {
    var para_arr = this.texts.split('\r\n');

    this.title = para_arr[0];
    this.content = para_arr[3];

    var data = null;

    if(para_arr[1]) {
        data = helper.split_text(para_arr[1]);
        this.position = data.position;
        this.type = data.type;
        this.date = data.date;
    }
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
