var UserModel = require('../../models').User;

describe('test/models/user.test.js', function () {
  it('should return proxy avatar url', function () {
    var user = new UserModel({email: 'alsotang@gmail.com'});
    user.avatar_url.should.eql('https://gravatar.com/avatar/eeb90e7b92f78e01cac07087165e3640?size=48');
  });
});
