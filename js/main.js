//----includes
const process = require('process');
const assert = require('assert');
//------------

/*
TODO: fix next_token() - he's can't work with name contains digits 
*/

const TokenKind = {
    'TOKEN_EOF': '\0',
    'TOKEN_UNDEFINED': 127,
    'TOKEN_INT': 128,
    'TOKEN_NAME': 129,
    'TOKEN_OPERATOR' : 130
};

const KEYWORD_IF = "if";
const KEYWORD_ELSE = "else";
const KEYWORD_WHILE = "while";
const KEYWORD_FOR = "for";

let stream = "";
let token;

let digits_array = new Array(0);
digits_array['0'] = 0;
digits_array['1'] = 1;
digits_array['2'] = 2;
digits_array['3'] = 3;
digits_array['4'] = 4;
digits_array['5'] = 5;
digits_array['6'] = 6;
digits_array['7'] = 7;
digits_array['8'] = 8;
digits_array['9'] = 9;

function get_ascii_code(str) {
    return str.charCodeAt(0);   
}

const A_ASCII_CODE      = get_ascii_code('A');
const a_ASCII_CODE      = get_ascii_code('a');
const z_ASCII_CODE      = get_ascii_code('z');
const Z_ASCII_CODE      = get_ascii_code('Z');
const ZERO_ASCII_CODE   = get_ascii_code('0');
const NINE_ASCII_CODE   = get_ascii_code('9');

function Token(kind, value, len) { 
    this.kind = kind;
    this.value = value;
}

function fatal(message) {
    console.error(message);
    process.exit(1);
}

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

function get_digit(ch) {
    return digits_array[ch];
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

function is_operator(operator) {
    switch(operator)
    {
        case '+':
        case '++':
        case '-':
        case '--':
		case '/':
		case '*':
		case '<':
		case '>':
		case '%':
		case '!':
		case '~':
		case '&':
		case '|':
		case '<<':
		case '>>':
		case '=':
		case '<=':
		case '>=':
		case '!=':
		case '==':
		case '&&':
        case '||':
        {
            return true;
        }
    }
    return false;
}
//---------------------------------------------------------

function init_stream(code) { 
    stream = code;
    next_token();
}

function shift_stream(shift) { 
    stream = stream.substring(shift, stream.length);         
}

function cut_seq(char_stream, condition) {
    let counter = 0;
    while(condition(char_stream[++counter])) {}
    return char_stream.substring(0, counter);
};

function next_token() {
    let len = 0;
    let shift_len = 0;
    let char = stream.charAt(0);
    if (isalpha(char)) { 
        let string_value = cut_seq(stream, isalnum);            
        shift_len = string_value.length;
        token = new Token(TokenKind.TOKEN_NAME, string_value);        
    } else if (isdigit(char)) {
        let i = 0;
        let value = 0;
        let digit = '';
        while (isdigit(digit = stream.charAt(i))) { 
            i++;
            value *= 10;
            value += get_digit(digit); ;
        }
        shift_len = i;
        token = new Token(TokenKind.TOKEN_INT, value);
    } else if (is_operator(char)) { 
        let string_operator = cut_seq(stream, is_operator);
        shift_len = string_operator.length;
        token = new Token(string_operator);
    } else if (stream.length == 0) { 
        token = new Token("\0");
    } else if(char == ' ') {
        shift_stream(1);
        next_token();
    } else {
        token = new Token(stream.charAt(0));
        shift_len = 1;
    }

    shift_stream(shift_len);
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

function lexer_test(src) {
    init_stream(src);
    while(stream.length > 0) {
        //print_token();
        next_token();
    }
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

function test_helpers_func() { 
    init_stream("*xy 23 for")
    assert(match_token('*'));    
    assert(is_token_name("xy")); next_token();
    assert(token.value == 23); next_token();
    assert(is_token_name("for")); next_token();
    assert(is_token(TokenKind.TOKEN_EOF));
}

/*
    expr3 = INT | '(' expr ')'
    expr2 = [-]expr3
    expr1 = expr2 [/*] expr2
    expr0 = expr1 [+-] expr1
    expr = expr0
*/

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
}

function parse_stmt() {
    if(is_token_name(KEYWORD_IF)) { 
        next_token();
        parse_if_stmt();
    }
}

//---------------------

function run_tests() { 
    std_func_test();
    lexer_test(code);
    test_helpers_func();
    parse_test();
}

function main() {
    run_tests();
}

main();