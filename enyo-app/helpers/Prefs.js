Prefs = {

    getCookie: function(name, defaultValue) {
      if (localStorage.getItem(name) !== null)
      {
        enyo.log("returning saved value for preference " + name + " of " + localStorage.getItem(name));
        return JSON.parse(localStorage.getItem(name));
      }
      else
      {
        enyo.log("returning default value for preference " + name + " of " + defaultValue);
        return defaultValue;
      }
    },
  
    setCookie: function(name, value) {
      enyo.log("setting " + name + " to " + JSON.stringify(value));
      localStorage.setItem(name, JSON.stringify(value));
    },
  
  }