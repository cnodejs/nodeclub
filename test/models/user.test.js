var UserModel = require('../../models').User;

describe('test/models/user.test.js', function () {
  it('should return proxy avatar url', function () {
    var user = new UserModel({email: 'alsotang@gmail.com'});
    user.avatar_url.should.eql('/agent?url=https%3A%2F%2Fgravatar.com%2Favatar%2Feeb90e7b92f78e01cac07087165e3640%3Fsize%3D48');
  });
});
