/*
    INT = [1-9][0-9]* | 0[xX][0-9a-fA-F]+
    FLOAT = [0-9]*[.]([0-9]*)?([eE][+-]?[0-9]+)?
    CHAR = '\'' . '\''
    STR = '"' [^"]* '"'
*/

const process = require('process');
const assert = require('assert');

let char_digits_array = new Array(0);
char_digits_array['0'] = 0;
char_digits_array['1'] = 1;
char_digits_array['2'] = 2;
char_digits_array['3'] = 3;
char_digits_array['4'] = 4;
char_digits_array['5'] = 5;
char_digits_array['6'] = 6;
char_digits_array['7'] = 7;
char_digits_array['8'] = 8;
char_digits_array['9'] = 9;
char_digits_array['a'] = 10; char_digits_array['A'] = 10;
char_digits_array['b'] = 11; char_digits_array['B'] = 11;
char_digits_array['c'] = 12; char_digits_array['C'] = 12;
char_digits_array['d'] = 13; char_digits_array['D'] = 13;
char_digits_array['e'] = 14; char_digits_array['E'] = 14;
char_digits_array['f'] = 15; char_digits_array['F'] = 15;

function get_digit(ch) {
    return char_digits_array[ch];
}

function get_ascii_code(str) {
    return str.charCodeAt(0);   
}

const A_ASCII_CODE      = get_ascii_code('A');
const a_ASCII_CODE      = get_ascii_code('a');
const z_ASCII_CODE      = get_ascii_code('z');
const Z_ASCII_CODE      = get_ascii_code('Z');
const ZERO_ASCII_CODE   = get_ascii_code('0');
const NINE_ASCII_CODE   = get_ascii_code('9');

//--------------------------STD_LIB---------------------------

function isalnum(val) {
    return isalpha(val) || isdigit(val);
}

function isalpha(ch) {
    if(typeof(ch) != typeof("")) return false;

    let code = get_ascii_code(ch);
    return A_ASCII_CODE <= code && code <= Z_ASCII_CODE || 
            a_ASCII_CODE <= code && code <= z_ASCII_CODE;
}

function isdigit(value) {
    if(typeof(value) != typeof("")) return false;

    let code = value.charCodeAt(0);
    return ZERO_ASCII_CODE <= code && code <= NINE_ASCII_CODE; 
}

function isspace(char){
    switch(char){
        case ' ': 
        case '\n':
        case '\r':
        case '\t':
        case '\v':
            return true;
        default:
            return false;
    }
}

function std_func_test() {
    assert(isalnum('A'));
    assert(isalnum('a'));

    assert(isalpha('f'));
    assert(!isalpha('2'));

    assert(isdigit('2'));
    assert(!isdigit('a'));

    assert(get_digit('2') == 2);
}

//---------------------------------------------------------

const TokenKind = {
    'TOKEN_EOF': '\0',
    'TOKEN_UNDEFINED': 127,
    'TOKEN_INT': 128,
    'TOKEN_NAME': 129,
    'TOKEN_OPERATOR' : 130,
    'TOKEN_STR' : 131,
    'TOKEN_CHAR' : 132,
    'TOKEN_INC' : 133,
    'TOKEN_DEC' : 134,
    'TOKEN_FLOAT': 135,
};

class Token {
    constructor(kind, value) { 
        this.kind = kind;
        this.value = value;    
    }
}

class Stream {
    constructor(str) {
        this.stream = str;
        this.p = 0;
    }

    get pos() {
        return this.p;
    }

    set pos(p) {
        this.p = p;
    }

    ch() {
        return this.stream[this.pos];
    }

    pre_inc() {
        this.inc();
        return this.ch();
    }

    sub(s, e) {
        return this.stream.substring(s, e);
    }

    post_inc() {
        let last_pos = this.p;
        this.inc();
        return this.stream[last_pos];
    }

    inc() {
        this.p++;
    }

}

function fatal(message) {
    console.error(message);
    process.exit(1);
}

function syntax_error(message) {
    console.error(message);
}

let stream;
let token;

function scan_int() {    
    let base = 10;
    let ch = stream.ch();
    if(ch == '0') {
        ch = stream.pre_inc();
        if(ch == 'x') {
            stream.inc();
            base = 16;
        } else if(ch == 'b') {
            stream.inc();
            base = 2;
        } else if(isdigit(ch)) {
            base = 8;
        }
    }

    let val = 0;
    for(;;) {        
        ch = stream.ch();
        let digit = get_digit(ch);        
        
        if(digit == undefined && ch != '0') {
            break;            
        }

        if(digit > base) {
            syntax_error("Digit " + digit + " out of range for base " + base);
            digit = 0;
        }

        if (val > Number.MAX_VALUE - digit / base) {
            syntax_error("Integer literal overflow, max 2^64");
            while(isdigit(stream.ch)) {
                stream.inc();                
            }
        }

        val = val * base + digit;
        stream.inc();
    }

    token.kind = TokenKind.TOKEN_INT;
    token.value = val;
}

function scan_float() { 

}

function scan_char() {

}

function scan_str() {
    
}

function next_token() {
    switch(stream.ch()) {
        case ' ': case '\n': case '\r': case '\t': case '\v': {
            while(isspace(stream.ch())) {
                stream.inc();            
            }
            next_token();
            break;
        }
        case 'a': case 'b': case 'c': case 'd': case 'e': case 'f': case 'g': case 'h': case 'i': case 'j':
        case 'k': case 'l': case 'm': case 'n': case 'o': case 'p': case 'q': case 'r': case 's': case 't':
        case 'u': case 'v': case 'w': case 'x': case 'y': case 'z':
        case 'A': case 'B': case 'C': case 'D': case 'E': case 'F': case 'G': case 'H': case 'I': case 'J':
        case 'K': case 'L': case 'M': case 'N': case 'O': case 'P': case 'Q': case 'R': case 'S': case 'T':
        case 'U': case 'V': case 'W': case 'X': case 'Y': case '_': {
            let start = stream.pos;
            let ch = stream.ch();
            while(isalnum(ch) || ch == '_') {
                ch = stream.inc();
            }

            token.kind = TokenKind.TOKEN_NAME;
            token.value = stream.sub(start, stream.pos);
            break;
        }
        case '\'':
            scan_char();
            break;  
        case '"':
            scan_str();
            break;  
        case '.':
            scan_float();
            break;
        case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9': {
            let start = stream.pos;

            while(isdigit(stream.ch())) {
                stream.inc();
            }

            let ch = stream.ch() == undefined ? '\0' : stream.ch(); 
            stream.pos = start;

            if(ch == '.' || ch.toLowerCase() == 'e') {
                scan_float();
            } else {    
                scan_int();
            }
            break;
        }
        default:
            token.kind = stream.post_inc();            
            break;
    }
}

function init_stream(code) {
    stream = new Stream(code);
    token = new Token();
    next_token();
}

function print_token() { 
    let buf = "Token kind of: ";
    switch(token.kind) { 
        case TokenKind.TOKEN_INT: buf += "INTEGER"; break;
        case TokenKind.TOKEN_NAME: buf += "NAME"; break;
        case TokenKind.TOKEN_OPERATOR: buf += "OPERATOR"; break;
        default: return;
    }

    buf += " value: " + token.value;
    console.log(buf);
}

function assert_token_int(val) {
    assert(token.value == val);
    assert(match_token(TokenKind.TOKEN_INT));
}

function lexer_test() {
    init_stream("0 23 0xFF 0b101 042");
    assert_token_int(0);
    assert_token_int(23);
    assert_token_int(0xFF);
    assert_token_int(0b101);
    assert_token_int(042);
}

function token_kind_name(kind) {
    switch(kind)
    {
        case TokenKind.TOKEN_INT: return "integer";
        case TokenKind.TOKEN_NAME: return "name";
        case TokenKind.TOKEN_NAME: return "operator";
        case TokenKind.TOKEN_EOF: return "eof";
    }

    return (kind);
}

function is_token(kind) {
    return token.kind == kind;           
}

function is_token_name(name) {
    return token.kind == TokenKind.TOKEN_NAME && token.value == name;
}

function match_token(kind) { 
    if(is_token(kind)) {
        next_token();
        return true;
    } else {
        return false;
    }
}

function expect_token(kind) {
    if(is_token(kind)) {
        next_token();
        return true;
    } else {
        fatal("expected token " + token_kind_name(kind) + ", got " + token_kind_name(token.kind) + ".");
        return false;
   }
}

function stream_test() {
    let str = new Stream("0 10 20");
    str.post_inc();
    assert(str.pos == 1);
    assert(str.ch() == ' ');
    assert(str.pre_inc() == '1');
    assert(str.sub(0, 3) == "0 1");
}
 

function parse_expr3() { 
    let val;
    if(is_token(TokenKind.TOKEN_INT)) { 
        val = token.value;
        next_token();
    } else if(match_token('(')) { 
        val = parse_expr();
        expect_token(')');
    } else {
        fatal("expected integer or (expr), got: " + token.kind);
    }
    return val;
}

function parse_expr2() { 
    let val;
    if(match_token('-')) { 
        val = -parse_expr3();
    } else {
        val = parse_expr3();
    }
    return val;
}

function parse_expr1() { 
    let val = parse_expr2();
    while(is_token('*') || is_token('/')) { 
        let op = token.kind;
        next_token();
        let rval = parse_expr2();
        
        if(op == '*') { 
            val *= rval;
        } else {
            assert(op == '/');
            assert(rval != 0);
            val /= rval;
        }
    }
    return val;
}

function parse_expr0() { 
    let val = parse_expr1();
    while(is_token('+') || is_token('-')) { 
        let op = token.kind;
        next_token();
        let rval = parse_expr1();

        if(op == '+') { 
            val += rval;
        } else {
            assert(op == '-');
            val -= rval;
        }
    }
    return val;
}

function parse_expr() { 
    return parse_expr0();
}

function test_parse_expr(expr) { 
    init_stream(expr);
    return parse_expr();
}

function TEST_EXPR(str, result) {
    assert(test_parse_expr(str) == result);
}

function parse_test() {
    TEST_EXPR("1", 1);
    TEST_EXPR("(1)", 1);
    TEST_EXPR("(1-2-3)", -4);
    TEST_EXPR("(2*(3)+(-1))", 5);
    TEST_EXPR("(2*(3)/(-2))", -3);
}

function run_tests() {
    stream_test();
    std_func_test();
    lexer_test();
    parse_test();
}

(function main() {
    run_tests();
})();