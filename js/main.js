//----includes
const process = require('process');
//------------

/*
TODO: fix next_token() - he's can't work with name contains digits 
*/

const TokenKind = {
    'TOKEN_LAST_CHAR': 127,
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

function Token(kind, value, len) { 
    this.kind = kind;
    this.value = value;
}

function fatal(message) {
    console.error(message);
    process.exit(1);
}

function is_alpha(ch) {
    return /^[A-Z]$/i.test(ch);
}

function is_digit(value) {
    return /[0-9]$/i.test(value);
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
        case ';':
        {
            return true;
        }
    }
    return false;
}

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
    if (is_alpha(stream.charAt(0))) { 
        let string_value = cut_seq(stream, is_alpha);            
        shift_stream(string_value.length);
        token = new Token(TokenKind.TOKEN_NAME, string_value);        
    } else if (is_digit(stream.charAt(0))) {
        let i = 0;
        let value = 0;
        let digit = '';
        while (is_digit(digit = stream.charAt(i))) { 
            i++;
            value *= 10;
            value += parseInt(digit, 0); ;
        }
        shift_stream(i);
        token = new Token(TokenKind.TOKEN_INT, value);
    } else if (is_operator(stream.charAt(0))) { 
        let string_operator = cut_seq(stream, is_operator);
        shift_stream(string_operator.length);
        token = new Token(TokenKind.TOKEN_OPERATOR, string_operator);
    } else if (stream.length == 0) { 
        token = null;
    } else {
        shift_stream(1);
        next_token();
    }    
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
    while(token != null) {
        //print_token();
        next_token();
    }
}

//-parser helpers functions
function is_token(kind) {
    if(typeof(kind) == typeof('')) {
        return token.kind == kind.charCodeAt(0);
    }
    return token.kind == kind;           
}

function is_token_name(name) {
    return token.kind == TokenKind.TOKEN_NAME && token.value == name;
}

function match_token(kind) { 
    if(is_token(kind)) { 
        return true;
    } else {
        return false;
    }
}

function token_kind_name(kind) {
    switch(kind)
    {
        case TokenKind.TOKEN_INT: return "integer";
        case TokenKind.TOKEN_NAME: return "name";
        case TokenKind.TOKEN_NAME: return "operator";
    }

    return String.fromCharCode(kind);
}

function expect_token(kind) {
    if(is_token(kind)) {
        return true;
    } else {
        fatal("expected token " + token_kind_name(token.kind) + ", got " + token_kind_name(kind) + ".");
        return false;
   }
}

function test_helpers_func() { 
    token = new Token(TokenKind.TOKEN_NAME, "while");
    console.log("Is token.kind == TOKEN_NAME: " + is_token('*'));
    console.log("Is token.value == while: " + is_token_name("while"));
    expect_token(TokenKind.TOKEN_NAME);
    expect_token(TokenKind.TOKEN_INT);
}

/*
    expr3 = INT | '(' exprs ')'
    expr2 = [-]expr3;
    expr1 = expr2 ([/*] expr2)*
    expr0 = expr1 ([+-] expr1)*
    expr = expr0
*/

function parse_expr3() { 
    if(is_token(TokenKind.TOKEN_INT)) { 
        next_token();
    } else if (match_token('(')) {
        parse_expr();
        expect_token(')');
    } else {
        fatal("expected integer or (, got " + token_kind_name(token.kind) + ")");
    }
}

function parse_expr2() { 
    if(match_token('-')) { 
        //... other calculation
        parse_expr3();
    } else {
        parse_expr3();
    }
}

function parse_expr1() { 
    parse_expr2();
    while(is_token('*') || is_token('/')) { 
        let op = token.kind;
        next_token();
        parse_exrp2();
    }
}

function parse_expr0() { 
    parse_expr1();
    while(is_token('+') || is_token('-')) {
        let op = token.kind;
        next_token();
        parse_expr1();
    }      
}

function parse_expr() { 
    parse_expr0();
}

function test_parse_expr(expr) { 
    init_stream(expr);
    parse_expr();
}

function parse_test() {
    test_parse_expr("!");
    test_parse_expr("1");
}

function parse_stmt() {
    if(is_token_name(KEYWORD_IF)) { 
        next_token();
        parse_if_stmt();
    }
}

//---------------------

const code = "x = 10;\n" +
            "while x < 20 then\n" +
                "x++;\n" +
            "print(x);";

function main() {
    lexer_test(code);
    //test_helpers_func();
    parse_test();
}

main();