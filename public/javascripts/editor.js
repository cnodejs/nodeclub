/**
 * 创建一个 EpicEditor
 *
 * @param {Element} textarea
 * @return {EpicEditor}
 */
function createEpicEditor (textarea) {
  var $node = $(textarea);
  var id = $node.attr('id');
  var h = $node.height();
  var l = $node.parents('.reply2_form').find('#editor_'+id).length;
  if (l == 0) {
    $node.before('<div id="editor_' + id + '" style="height:' + h + 'px; border: 1px solid #DDD; border-radius: 4px;"></div>');
  }
  $node.hide();

  var opts = {
    container: 'editor_' + id,
    textarea: id,
    basePath: '/public/libs/epiceditor',
    clientSideStorage: false,
    useNativeFullscreen: true,
    parser: marked,
    theme: {
      base: '/themes/base/epiceditor.css',
      preview: '/themes/preview/github.css',
      editor: '/themes/editor/epic-light.css'
    },
    button: {
      preview: true,
      fullscreen: true,
      bar: true
    },
    focusOnLoad: false,
    shortcut: {
      modifier: 18,
      fullscreen: 70,
      preview: 80
    },
    string: {
      togglePreview: '预览',
      toggleEdit: '编辑',
      toggleFullscreen: '全屏'
    },
    autogrow: {
      minHeight: 200
    }
  };

  var editor = new EpicEditor(opts);

  // 进入全屏模式时，给编辑器增加一些额外的样式
  function _fullscreenenter ($e) {
    var d = {
      margin:  '90px 8px 8px 8px',
      padding: '8px',
      border:  '1px solid #aaa',
      width:    $e.width() - 34,
      height:   $e.height() - 114
    };
    setTimeout(function () {
      $e.css(d);
    }, 100);
  }
  function _fullscreenexit ($e) {
    $e.css({
      margin:  '0',
      padding: '0',
      border:  'none'
    });
  }
  function fullscreenenter () {
    _fullscreenenter($(editor.editorIframe));
    _fullscreenenter($(editor.previewerIframe));
    window.e = editor;
  }
  function fullscreenexit () {
    _fullscreenexit($(editor.editorIframe));
    _fullscreenexit($(editor.previewerIframe));
  }
  editor.on('fullscreenenter', fullscreenenter);
  editor.on('fullscreenexit', fullscreenexit);
  $(window).resize(function () {
    if (editor.is('fullscreen')) {
      fullscreenenter();
    }
  });

  return editor;
}

/**
 * 向EpicEditor末尾增加内容
 *
 * @param {EpicEditor} editor
 * @param {String} text
 * @return {String}
 */
function epicEditorAppend (editor, text) {
  return editor.getElement('editor').body.innerHTML += text;
}

/**
 * 向EpicEditor前面增加内容
 *
 * @param {EpicEditor} editor
 * @param {String} text
 * @return {String}
 */
function epicEditorPrepend (editor, text) {
  return editor.getElement('editor').body.innerHTML = text + editor.getElement('editor').body.innerHTML;
}

// 自动创建编辑框
$(function () {
  var $node = $('#wmd-input');
  if ($node.length > 0) {
    createEpicEditor($node).load();
  }
});
