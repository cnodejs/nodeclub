/**
 * Simplify by https://github.com/goessner/markdown-it-texmath
 */
function texmath(md) {
  texmath.rules.inline.forEach(function (rule) {
    md.inline.ruler.before('escape', rule.name, texmath.inline(rule)); // !important
    md.renderer.rules[rule.name] = function (tokens, idx) {
      return rule.tmpl.replace(/\$1/, tokens[idx].content);
    };
  });
  texmath.rules.block.forEach(function (rule) {
    md.block.ruler.before('fence', rule.name, texmath.block(rule)); // !important for ```math delimiters
    md.renderer.rules[rule.name] = function (tokens, idx) {
      return rule.tmpl
        .replace(/\$2/, tokens[idx].info) // equation number
        .replace(/\$1/, tokens[idx].content);
    };
  });
}

texmath.inline = (rule) => (state, silent) => {
  var pos = state.pos;
  var str = state.src;
  rule.rex.lastIndex = pos;

  if (!str.startsWith(rule.tag, pos)) return false;
  if (rule.pre && !rule.pre(str, pos)) return false;

  var match = rule.rex.exec(str);
  if (!match || pos >= rule.rex.lastIndex) return false;

  if (rule.post && !rule.post(str, rule.rex.lastIndex - 1)) return false;
  // match and valid post-condition ...
  if (!silent) {
    var token = state.push(rule.name, 'math', 0);
    token.content = match[1];
    token.markup = rule.tag;
  }
  state.pos = rule.rex.lastIndex;
  return true;
};

texmath.block = (rule) => (state, begLine, endLine, silent) => {
  var pos = state.bMarks[begLine] + state.tShift[begLine];
  var str = state.src;
  rule.rex.lastIndex = pos;

  if (!str.startsWith(rule.tag, pos)) return false;
  if (rule.pre && !rule.pre(str, pos)) return false;

  var match = rule.rex.exec(str);
  if (!match || pos >= rule.rex.lastIndex) return false;

  if (rule.post && !rule.post(str, rule.rex.lastIndex - 1)) return false;
  // match and valid post-condition ...
  if (!silent) {
    var endpos = rule.rex.lastIndex - 1;
    var curline;
    for (curline = begLine; curline < endLine; curline++) {
      // line for end of block math found
      if (endpos >= state.bMarks[curline] + state.tShift[curline] && endpos <= state.eMarks[curline]) {
        break;
      }
    }
    // "this will prevent lazy continuations from ever going past our end marker"
    // s. https://github.com/markdown-it/markdown-it-container/blob/master/index.js
    var oldLineMax = state.lineMax;
    var oldParent = state.parentType;
    state.lineMax = curline;
    state.parentType = 'math';
    // remove all leading '>' inside multiline formula
    if (oldParent === 'blockquote') {
      match[1] = match[1].replace(/(\n*?^(?:\s*>)+)/gm, '');
    }
    // 'math_block'
    var token = state.push(rule.name, 'math', 1);
    token.block = true;
    token.markup = rule.tag;
    token.content = match[1];
    token.info = match[match.length - 1]; // eq.no
    token.map = [begLine, curline];
    // restore state
    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.line = curline + 1;
  }
  return true;
};

// used for enable/disable math rendering by `markdown-it`
texmath.inlineRuleNames = ['math_inline', 'math_inline_double'];
texmath.blockRuleNames = ['math_block', 'math_block_eqno'];

texmath.$_pre = function (str, beg) {
  // no backslash, digit before opening '$'
  return /[^\\0-9]/.test(str[beg - 1]);
};
texmath.$_post = function (str, end) {
  // no digit after closing '$'
  return /[^0-9]/.test(str[end + 1]);
};

texmath.rules = {
  inline: [{
    name: 'math_inline_double',
    rex: /\${2}((?:\S)|(?:\S.*?\S))\${2}/gy,
    tmpl: '<section><eqn>$1</eqn></section>',
    tag: '$$',
    displayMode: true,
    pre: texmath.$_pre,
    post: texmath.$_post
  }, {
    name: 'math_inline',
    rex: /\$((?:\S)|(?:\S.*?\S))\$/gy,
    tmpl: '<eq>$1</eq>',
    tag: '$',
    pre: texmath.$_pre,
    post: texmath.$_post
  }],
  block: [{
    name: 'math_block_eqno',
    rex: /\${2}([^$]+?)\${2}\s*?\(([^)\s]+?)\)/gmy,
    tmpl: '<section><eqn>$1</eqn><span>($2)</span></section>',
    tag: '$$'
  }, {
    name: 'math_block',
    rex: /\${2}([^$]+?)\${2}/gmy,
    tmpl: '<section><eqn>$1</eqn></section>',
    tag: '$$'
  }]
};

module.exports = texmath;
