
/**
 * Auto change 'textarea.editor' to ace editor. 
 */

$(function () {
  $('textarea.editor').each(function () {
    var $node = $(this);
    var id = $node.attr('id');
    var h = $node.height();
    $node.before('<div id="ace_' + id + '" style="height:' + h + 'px; border: 1px solid #DDD; border-radius: 4px;"></div>');
    $node.hide();

    var editor = ace.edit("ace_" + id);

    var heightUpdateFunction = function () {

      // http://stackoverflow.com/questions/11584061/
      var newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + 
        editor.renderer.scrollBar.getWidth();
      if (newHeight < h) {
        newHeight = h;
      }
      newHeight += 5;
      $('#ace_' + id).height(newHeight + "px");
      //$('#editor-section').height(newHeight.toString() + "px");

      // This call is required for the editor to fix all of
      // its inner structure for adapting to a change in size
      editor.resize();
    };

    // Set initial size to match initial content
    heightUpdateFunction();

    // Whenever a change happens inside the ACE editor, update
    // the size again
    editor.getSession().on('change', heightUpdateFunction);

    editor.getSession().setTabSize(2);
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setUseWrapMode(true);
    editor.renderer.setShowGutter(false);
    editor.setShowPrintMargin(false);
    editor.setValue($node.val(), 1);
    editor.focus();
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/markdown");
    editor.getSession().on('change', function () {
      $node.val(editor.getValue());
    });
  });
});