// configure marked
var renderer = new marked.Renderer()
renderer.code = function (code, lang) {
  var ret = '<pre class="prettyprint language-' + lang + '">'
  ret += '<code>' + code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>'
  ret += '</pre>'
  return ret
}
marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true
});
$('.action_preview').click(function (event) {
  event.preventDefault()
  var $editor = $(this).parents('.markdown_editor');
  $editor.removeClass('in_editor').addClass('in_preview');
  var content = $editor.find('textarea.editor').val();
  var html = marked(content);
  $editor.find('.preview').html(html);
  prettyPrint();
});
$('.action_modify').click(function (event) {
  event.preventDefault()
  var $editor = $(this).parents('.markdown_editor');
  $editor.removeClass('in_preview').addClass('in_editor');
  $editor.find('textarea.editor').focus()
});
