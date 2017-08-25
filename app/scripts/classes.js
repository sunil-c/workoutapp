
/*** UTILITY CLASS ***/
var Util = function() {
  //resets values if existing object passed in
  if (this instanceof Util) {

  } else {
    return new Util();
  }
};

// return a UUID
Util.prototype.uuid = function() {
  /* jshint bitwise:false */
  console.log('util.uuid');
  var i;
  var random;
  var uuid = '';

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return uuid;
};

// Pluralize a singular word
Util.prototype.pluralize = function(count, word) {
  console.log('util.pluralize');
  return count === 1 ? word : word + 's';
};

// If namespace and data passed in then store, else retrieve items in namespace
Util.prototype.store = function(namespace, data) {
  console.log('util.store');
  if (arguments.length > 1) {
    return localStorage.setItem(namespace, JSON.stringify(data));
  } else {
    var store = localStorage.getItem(namespace);
    return (store && JSON.parse(store)) || [];
  }
};

// Removes a key from the localdatastore
Util.prototype.remove = function(namespace) {
  var nameLength = namespace.length;

  Object.keys(localStorage)
    .forEach(function(key) {
      if (key.substring(0, nameLength) === namespace) {
        localStorage.removeItem(key);
      }
    });
};

// Produces a random integer
Util.prototype.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

// Turns a DOM section on and all others off depending on flag value
Util.prototype.showSection = function(route, hideOtherSections) {
  console.log('showSection');
  hideOtherSections = (typeof hideOtherSections !== 'undefined') ? hideOtherSections : true;
  // get a list of all containers with section class
  var sections = $('.section');
  var section;
  // choose the one section we want
  section = sections.filter('[data-route=' + route + ']');

  if (section.length) {
    if (hideOtherSections) {
      sections.removeClass('show');
      sections.addClass('hide');
    }

    section.removeClass('hide');
    section.addClass('show');
  }
};

/*** ERROR HANDLER ***/
var ErrorHandler = function(serviceURL) {
  //resets values if existing object passed in
  if (this instanceof ErrorHandler) {
    // instance variables
    this.serviceURL = serviceURL || '';
    this.msg = '';
    this.error = '';
    this.errorURL = '';
    this.line = 0;
    this.col = 0;
  } else {
    return new ErrorHandler(serviceURL);
  }
  this.getURL = function() {
    return this.serviceURL;
  };
};

ErrorHandler.prototype.getError = function() {
  var formattedMsg;
  formattedMsg = !this.msg ? '' : '\nMessage: ' + this.msg;
  formattedMsg += !this.errorURL ? '' : '\nLocation: ' + this.errorURL;
  formattedMsg += !this.line ? '' : '\nLine: ' + this.line;
  formattedMsg += !this.col ? '' : '\nColumn: ' + this.col;
  formattedMsg += !this.error ? '' : '\nError: ' + this.error;

  return formattedMsg;
};

ErrorHandler.prototype.onError = function(msg, url, line, col, error) {
  // Note that col & error are new to the HTML 5 spec and may not be supported in every browser.

  // store in instance variables
  this.msg = msg;
  this.errorURL = url;
  this.line = line;
  this.col = !col ? '' : col;
  this.error = !error ? '' : error;

  // You can view the information in an alert to see things working like this: alert('Error: ' + this.getError());

  // Report this error via ajax so you can keep track of what pages have JS issues ignore result
  // TODO

  var suppressErrorAlert = true;
  // If you return true, then error alerts (like in older versions of Internet Explorer) will be suppressed.
  return suppressErrorAlert;
};

/*****************************************************************************/
//RESPONSIVE COLUMN TABLE
/*****************************************************************************/
var ColumnReport = function () {
  //resets values if existing object passed in
  if (this instanceof ColumnReport) {
      this.callBack = {};
      this.errCallBack = {};
  } else {
      return new ColumnReport();
  }
};
ColumnReport.prototype.getCallBack = function () {
  return this.callBack;
};
ColumnReport.prototype.setCallBack = function (val) {
  this.callBack = val;
};
ColumnReport.prototype.getErrCallBack = function () {
  return this.errCallBack;
};
ColumnReport.prototype.setErrCallBack = function (val) {
  this.errCallBack = val;
};
ColumnReport.prototype.getData = function (url, data, callBack, errCallBack) {
  /* arguments
   * url = the url from where to get the data
   * data = json object with parameters
   * callBack = pointer to function to call upon success
   * errCallBack = pointer to error handler
   */
  console.log("ColumnReport.getData");

  this.setCallBack(callBack);
  this.setErrCallBack(errCallBack);

  var self = this;
  data = data || {};
  $.ajax({
      method: "GET",
      url: url,
      data: data,
      dataType: "script",
      beforeSend: function () {

      },
      success: function (data) {
          data = JSON.parse(data);
          var func = self.getCallBack();
          func.call(null, data);
      },
      error: function (err) {
          var func = self.getErrCallBack();
          func.call(null, err);
      }
  });
};
ColumnReport.prototype.getResponsiveColumnTable = function (data, displayHeaders, displayFooter) {
  //creates a responsive table based on the data object displayed at the bottom of this file

  var cols, rows, row, colCount, rowCount;
  var hasColumnsProperty = data[0].hasOwnProperty("columns");
  var hasRowProperty = data[0].hasOwnProperty("rows");
  var hasFooterProperty = data[0].hasOwnProperty("footer");
  //if no column property then return empty div 
  if (!hasColumnsProperty) {
      return $('<div/>')
  }
  else {
      colCount = data[0].columns.names.length;
  }
  //if no rows property set rows to 0
  rowCount = !hasRowProperty ? 0 : data[0].rows.length;
  
  //var d1 = $('<div/>').addClass("container-fluid");
  var d2 = $('<div/>').addClass("table-responsive");//.appendTo(d1);
  var t1 = $('<table/>').addClass("table table-striped table-hover").appendTo(d2);
  var h1 = $('<thead/>').appendTo(t1);
  var b1 = $('<tbody/>').appendTo(t1);

  //create the header row
  if (displayHeaders === true && hasColumnsProperty && data[0].columns.hasOwnProperty("names")) {
      var row = $('<tr/>').appendTo(h1);

      //create column headers
      for (cols = 0; cols < colCount; cols++) {
        $('<th/>').text(data[0].columns.names[cols]).addClass(data[0].columns.hdrAttr[cols]).appendTo(row);        
      }
  }

  //create the data rows
  if (hasRowProperty && data[0].rows.length > 0) {
      for (rows = 0; rows < rowCount; rows++) {
          //create row
          row = $('<tr/>').appendTo(b1);
          //create cells
          for (cols = 0; cols < colCount; cols++) {
              $('<td />').text(data[0].rows[rows].values[cols]).addClass(data[0].columns.cellAttr[cols]).appendTo(row);
          }
      }
  }

  if (displayFooter === true && hasFooterProperty && (data[0].footer.length > 0)) {
      var row = $('<tr/>').appendTo(b1);
      //create footers
      for (cols = 0; cols < colCount; cols++) {
          $('<td/>').text(data[0].footer[0].values[cols]).addClass(data[0].columns.ftrAttr[cols]).appendTo(row);
      }
  }
  return d2;
  //return d1;
};
ColumnReport.prototype.getMasterDtlTable = function (data, displayHeaders) {
  //creates a responsive table with a header for the master record 

  //some variables
  var mstrRow, mstrRow, mstrColCount, mstrRowCount;
  var mstrCellAttr = [], mstrHdrAttr = [], mstrRows = [], strVal = "", idVal = 0, label = "";
  var dtlData = [], newRows = [], saveRows = [];

  //master cell and header attrs
  mstrCellAttr = data[0].columns.cellAttr;
  mstrHdrAttr = data[0].columns.hdrAttr;
  //get the master rows
  mstrRows = data[0].rows;
  mstrColCount = data[0].columns.names.length;
  mstrRowCount = data[0].rows.length;
  saveRows = data[1].rows;

  var d1 = $('<div/>').addClass("container-fluid");
  for (mstrRow = 0; mstrRow < mstrRowCount; mstrRow++) {
      //build the label above the detail table
      strVal = mstrRows[mstrRow].values[1];
      idVal = mstrRows[mstrRow].values[0];
      label = $('<h3/>').text(strVal).attr('data-id', idVal).addClass(mstrHdrAttr[1]).appendTo(d1);
      //get the detail object
      dtlData[0] = data[1];
      //iterate the saved rows and save the ones that match the id val from teh master record
      newRows = [];
      $.each(saveRows, function (index, value) {
          if (value.values[0] == idVal) {
              newRows[newRows.length] = value;
          }
      });
      //replace the rows array with the new array
      dtlData[0].rows = newRows;
      d1.append(this.getResponsiveColumnTable(dtlData, false, false));
  }


  return d1;
};


/*****************************************************************************/
//RESPONSIVE ROW TABLE
/*****************************************************************************/
var RowReport = function () {
  //resets values if existing object passed in
  if (this instanceof RowReport) {
      this.callBack = {};
      this.errCallBack = {};
  } else {
      return new RowReport();
  }
};
RowReport.prototype.getCallBack = function () {
  return this.callBack;
};
RowReport.prototype.setCallBack = function (val) {
  this.callBack = val;
};
RowReport.prototype.getErrCallBack = function () {
  return this.errCallBack;
};
RowReport.prototype.setErrCallBack = function (val) {
  this.errCallBack = val;
};
RowReport.prototype.getData = function (url, data, callBack, errCallBack) {
  /* arguments
   * url = the url from where to get the data
   * data = json object with parameters
   * callBack = pointer to function to call upon success
   * errCallBack = pointer to error handler
   */
  this.setCallBack(callBack);
  this.setErrCallBack(errCallBack);

  var self = this;
  data = data || {};
  $.ajax({
      method: "GET",
      url: url,
      data: data,
      dataType: "script",
      beforeSend: function () {

      },
      success: function (data) {
          data = JSON.parse(data);
          var func = self.getCallBack();
          func.call(null, data);
      },
      error: function (err) {
          var func = self.getErrCallBack();
          func.call(null, err);
      }
  });
};
RowReport.prototype.getResponsiveRowTable = function (data, displayHeaders) {
  //creates a responsive table based on the data object displayed at the bottom of this file

  //some variables
  var cols, rows, row, colCount, rowCount;
  colCount = data[0].columns.names.length;
  rowCount = data[0].rows.length;

  //var d1 = $('<div/>').addClass("container-fluid");
  var d2 = $('<div/>').addClass("table-responsive");//.appendTo(d1);
  var t1 = $('<table/>').addClass("table table-striped table-hover").appendTo(d2);
  var h1 = $('<thead/>').appendTo(t1);
  var b1 = $('<tbody/>').appendTo(t1);

  //create the header row
  if (displayHeaders === true) {
      var row = $('<tr/>').appendTo(h1);
      //create column headers
      for (cols = 0; cols < colCount; cols++) {
          $('<th/>').text(data[0].columns.names[cols]).addClass(data[0].columns.hdrAttr[cols]).appendTo(row);
      }
  }

  //create the data rows
  for (rows = 0; rows < rowCount; rows++) {
      //create row
      row = $('<tr/>').appendTo(b1);
      //create cells
      for (cols = 0; cols < colCount; cols++) {
          $('<td />').text(data[0].rows[rows].values[cols]).addClass(data[0].columns.cellAttr[cols]).appendTo(row);
      }
  }

  return d2;
  //return d1;
};
