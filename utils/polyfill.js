  //对象
  var object = {
    assignIn: function(target){
        'use strict';
        if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
        }

        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source != null) {
            for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
            }
        }
        }
        return target;
  },   
  isObjectValueEqual: function(a,b){
      var aProps = Object.getOwnPropertyNames(a);
      var bProps = Object.getOwnPropertyNames(b);
      if (aProps.length != bProps.length) {
          return false;
      }
      for (var i = 0; i < aProps.length; i++) {
          var propName = aProps[i];
            if (a[propName] !== b[propName]) {
                return false;
            }
      }
      return true;
  }
}

module.exports = {
  object: object
}
