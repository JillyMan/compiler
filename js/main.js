const TOKEN_UNDEFINED = -1;

const TOKEN_INT = 1;
const TOKEN_NAME = 2;
const TOKEN_OPERATOR = 3;
const TOKEN_RESERVED = 4;

const KEYWORD_IF = "if";
const KEYWORD_ELSE = "else";
const KEYWORD_WHILE = "while";
const KEYWORD_FOR = "for";

const UNDEFINED_VALUE_LENGTH = 1;

function TokenKind(tokenType, tokenValue, tokenLength) {
    this.type = tokenType;
    this.value = tokenValue;
    this.length = tokenLength;
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

function next_token(characters, start) {

    if(start >= characters.length) {
        return null;
    }

    let tokenKind = null;
    let currentChar = characters[start];

    let func = function(stream, start, condition) {
        let char_stream = [];
        let current_char = stream[start];
        let index = start;
        do 
        {
            char_stream.push(current_char);
            current_char = stream[++index];
        } while(condition(current_char));
        return char_stream.join("");
    };

    if(is_alpha(currentChar))
    {
        let string = func(characters, start, is_alpha);
        let end = string.length + start;
        tokenKind = new TokenKind(TOKEN_NAME, string, end - start);
    }
    else if(is_digit(currentChar))
    {
        let value = 0;
        let end = start;

        do
        {
            let digit = parseInt(currentChar, 0); 
            value *= 10;
            value += digit;
            currentChar = characters[++end];
        } while(is_digit(currentChar));

        tokenKind = new TokenKind(TOKEN_INT, value, end - start);
    }
    else if(is_operator(currentChar))
    {
        let string_operator = func(characters, start, is_operator);
        let end = string_operator.length + start;
        tokenKind = new TokenKind(TOKEN_OPERATOR, string_operator, end - start);
    }
    else
    {
        tokenKind = new TokenKind(TOKEN_UNDEFINED, undefined, UNDEFINED_VALUE_LENGTH);
    }
    return tokenKind;
}

function lexer(characters) {
    let pos = 0;
    let tokens = [];

    while(pos < characters.length) 
    {
        let token = next_token(characters, pos);
        if(token != null)
        {
            if(token.type != TOKEN_UNDEFINED)
            {
                tokens.push(token);
            }

            pos += token.length;
        }
    }

    return tokens;
}

const code = "x = 10;\n" + 
            "while x < 20 then\n" +
                "x++;\n" +
            "print(x);";

function main() {
    console.log("Start parse: " + code);

    let tokens = lexer(code);

    console.log(tokens);  
}

main();