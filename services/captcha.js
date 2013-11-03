

var Config = require('../config').config;
var Crypto = require('crypto');

var captcha_alphabet = Config.captcha_alphabet;
var captcha_length = Config.captcha_length;
var captcha_secret = Config.captcha_secret;


exports.get_text = function(random) {
  if (captcha_length < 1 || captcha_length > 16) {
    throw "Character count of " + captcha_length + " is outside the range of 1-16";
  }

  var input = '' + captcha_secret + random;

  if (captcha_alphabet != 'abcdefghijklmnopqrstuvwxyz' || captcha_length != 6) {
    input += ":" + captcha_alphabet + ":" + captcha_length;
  }

  var s = Crypto.createHash('md5');
  s.update(input);
  var md5 = s.digest('binary');

  var text = ''
  for(var i = 0; i < captcha_length; i++)
  {
    index = md5.charCodeAt(i) % captcha_alphabet.length;
    text += captcha_alphabet.charAt(index);
  }

  return text;
}
