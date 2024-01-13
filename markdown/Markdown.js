const { markdownElementMap } = require("./MarkdownElement");

console.log(translate("# Hello **Be cool bro** **Actually**"))


/**
 * A function to translate the markdown provided in a text to HTML.
 * @param {string} text 
 */
function translate(text) {
    const words = text.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = format(words[i]);
    }

    return words.join(" ")
}
module.exports = {
    translate
}