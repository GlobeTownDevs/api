window.MockXMLHttpRequest = (function (realXHR) {
  var _realXHR = realXHR || {};

  function MockXHR () {
    this.method = null;
    this.url = null;
    this.readyState = 0;
    this.status = null;
    this.response = null;
    this.responseText = null;
    this.listeners = {};
  }
  MockXHR.prototype.setRequestHeader = function() {

  }

  MockXHR.prototype.__restore = function () {
    window.XMLHttpRequest = _realXHR;
  }

  MockXHR.prototype.__defaultResponse = {};

  MockXHR.prototype.__setResponse = function (data) {
    this.response = data;
    this.responseText = JSON.stringify(data);
  }

  MockXHR.prototype.open = function (method, url) {
    this.method = this.method;
    this.url = this.url;
  };

  MockXHR.prototype.send = function (body) {
    var self = this;

    setTimeout(function () {
      self.readyState = 4;
      self.status = 200;
      self.response = self.response || self.__defaultResponse;
      self.responseText = JSON.stringify(self.response);
      self.onreadystatechange();
      self.listeners.load.forEach(function (f) {f.bind(self)();})
    }, 0);
  };
  MockXHR.prototype.addEventListener = function (eventName, fn) {
    (this.listeners[eventName] = this.listeners[eventName] || []).unshift(fn);
  };
  MockXHR.prototype.onreadystatechange = function () {};

  return MockXHR;
})(window.XMLHttpRequest);
