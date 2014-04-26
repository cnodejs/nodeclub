// configure marked
var renderer = new marked.Renderer()
renderer.code = function(code, lang) {
  var ret = '<pre class="prettyprint language-' + lang + '">'
  ret+= '<code>' + code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>'
  ret+= '</pre>'
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
$('.action_preview').click(function(event) {
  event.preventDefault()
  var $editor = $(this).parents('.markdown_editor');
  $editor.removeClass('in_editor').addClass('in_preview');
  var content = $editor.find('textarea.editor').val();
  if (content !== '') {
    $editor.find('div.markdown_in_preview')
    .find('div.editor_buttons')
    .find('button.reply2_submit_btn')
    .removeAttr('disabled');
  } else {
    $editor.find('div.markdown_in_preview')
    .find('div.editor_buttons')
    .find('button.reply2_submit_btn')
    .attr('disabled', 'disabled');
  }
  var html = marked(content);
  $editor.find('.preview').html(html);
  prettyPrint();
});
$('.action_modify').click(function() {
  event.preventDefault()
  var $editor = $(this).parents('.markdown_editor');
  $editor.removeClass('in_preview').addClass('in_editor');
  $editor.find('textarea.editor').focus()
});

$('.action_cancel').click(function(event) {
  event.preventDefault();
  var $editor = $(this).parents('.markdown_editor');
  var $form = $(this).parents('form.reply2_form');
  $editor.removeClass('in_preview').addClass('in_editor');
  $form.find('textarea.reply_editor').val('');
  $(this).next('button.reply2_submit_btn').attr('disabled', 'disabled');
  $editor.find('div.markdown_in_editor')
         .find('div.editor_buttons')
         .find('button.reply2_submit_btn')
         .attr('disabled', 'disabled');
  $form.hide('fast');
});
