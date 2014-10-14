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

/*
==========
白痴 (陀思妥耶夫斯基)
- 您在位置 #4813-4819的标注 | 添加于 2014年10月12日星期日 下午10:23:50

两个农民，都上了年纪，都没有喝醉酒，而且早就互相认识，是朋友。他俩喝了茶，想睡在一起，住在同一间小屋里。但是最近两天，一个农民无意中发现另一个农民有一块银表，挂在一根用黄珠子串的表链上，他从前大概不知道他有这块表。这人不是贼，甚至很清白，也很老实，按农民的生活水平看，也完全不穷。但是他非常喜欢这块表，这表对他很有诱惑力，他终于经不住诱惑：拿起刀来，趁朋友转身的时候，蹑手蹑脚地走到他身后，对准了，然后举首望天，画了个十字，痛苦地默默祷告：‘主啊，看在基督分上，饶恕我吧！’——接着便当头一刀，劈死了他的朋友，就像宰头羊似的，掏走了他的表。”
==========
白痴 (陀思妥耶夫斯基)
- 您在位置 #4832-4835的标注 | 添加于 2014年10月12日星期日 下午10:25:07

一个乡下女人，怀里抱着吃奶的孩子。这女人很年轻，这孩子也才出生六七个星期。这孩子向她嫣然一笑，据她观察，这是他出生以来头一次笑。我看着她十分虔诚地画了个十字。我问她：‘大姐，你干吗呀？’（我当时什么都问。）她说：‘一个母亲发现自己的孩子头一次笑，做母亲的那份高兴呀，都这样。就像上帝在天上，每次看到一个罪人在他面前真心诚意地跪下来祷告时，所感到的喜悦一样。’
==========
*/

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

