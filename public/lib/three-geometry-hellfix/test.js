'use strict';

require('mocha');
var assert = require('assert');
var MyLibrary = require('./');

var myInstance = new MyLibrary.MyClass();
var expectedString = 'myNum='+MyLibrary.CONST_A+' myString='+MyLibrary.CONST_B;

describe('Basic library test', function() {
    it('should generate a constant string (1) and repeat it (2)', function() {
      assert.strictEqual(myInstance.getMe(), expectedString);
      assert.strictEqual(myInstance.getMeDouble(), expectedString+expectedString);
    });
});
