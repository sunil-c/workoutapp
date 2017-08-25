(function () {
  'use strict';

  console.log('starting app.js');

  var gDomMessage = $("#msgContent");;
  var gExercises = []; //array of exercise objects
  var gExerciseType = ['strength', 'cardio', 'hiit'];

  /*** object templates ***/
  var __gExerciseTemplate = function (exerciseType, exerciseName, exerciseDate) {
    //resets values if existing object passed in
    if (this instanceof __gExerciseTemplate) {
      this.exerciseID = 0;
      this.exerciseName = exerciseName || 'Exercise Name';
      this.exerciseType = exerciseType;
      this.exerciseDate =  exerciseDate || moment().format("L"); //init to the current date mm/dd/yyyy
      this.sets = [__gSetTemplate()];
    } else {
      return new __gExerciseTemplate();
    }
  }

  //returns a set object
  var __gSetTemplate = function () {
    return {
      setID: 0,
      weight: 0,
      reps: 0,
      rest: 90,
      distance: 0,
      duration: 0,
      order: 0
    }
  }

  /*** end templates ***/

  var gServicePath = "",
    gAuthPath = "",
    gCompanyID = 0,
    gRenderedFilters = false;

  if (window.location.host.indexOf('localhost') >= 0) { // running from localhost
    gServicePath = '';
    gAuthPath = '';
  } else { // on web server
    gAuthPath = '';
    gServicePath = '';
  }

  var errorhandler = new ErrorHandler(gServicePath + "/error/logerror");
  //build an error message
  var buildErrorMessage = function (msg) {
    var domObj = $('<div class="alert alert-warning alert-dismissible fade in" role="alert" />');
    var btnObj = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close" />');
    var spanObj = $('<span aria-hidden="true">&times;</span>');
    var pObj = $('<p />').text(msg);
    btnObj.append(spanObj);
    domObj.append(btnObj);
    domObj.append(pObj);

    return domObj;
  }

  //handle global error
  var handleError = function (msg, url, line, col, error) {
    errorhandler.onError(msg, url, line, col, error);
    var domObj = buildErrorMessage(errorhandler.getError());
    gDomMessage.append(domObj);

    return true;
  };
  //set the bubble up function
  window.onerror = handleError;

  //initialize the Util object
  var util = new Util();
  //initialize report objects
  var colRpt = new ColumnReport();
  var rowRpt = new RowReport();

  //handlebars config
  Handlebars.registerHelper('eq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  /*** Rendering Routines ***/
  var renderExercise = function (data) {
    console.log('renderDynamicStrength');
    //need to process strength data to fit the handlebars template
    //processing...

    var out = colRpt.getResponsiveColumnTable(data, true, false);
    var exerciseID = data[0].exerciseID.toString();
    var exerciseName = data[0].exerciseName;

    var c = $("#__card-template").clone().attr("id", "exer-" + exerciseID).removeClass("hide");
    c.find(".panel-title").html(exerciseName);
    c.find('.dynamic-strength-table').append(out);
    //add the ability to put any td.cell into edit mode
    var $td = c.find('.cell');

    $td.on({
      'click': function(){
        //when clicked we add an input inline into the td tag
        var inp = $("<input type='text'>");
        var saveText = $(this).text();
        var saveTD = $(this);
        //add events to input
        inp.on({
          'blur': function(){
            //when focus leaves input then save contents and make it disappear
            var currVal = $(this).val();
            //no change no save
            if (currVal !== saveText && currVal.length > 0){
              console.log('saving changed value: ' + currVal);
              //TODO: add code for saving

              saveText = currVal;
            }
            else{
               console.log('no change');
            }
            clearTD(saveTD, saveText);
          }
        });

        //init the input
        inp.prop("placeholder",  $(this).text());
        //clear text
        $(this).empty();
        //add input to screen
        $(this).append(inp);
        //place cursor where it needs to go
        inp.focus();
      }
    });

    $("#dataSection").append(c);
  };

  //called by blur event of input
  var clearTD = function(saveTD, saveText){
    saveTD.empty();
    saveTD.text(saveText);
  };

  var renderExercises = function (exercises) {
    console.log('renderExercises');
    //TODO: get and render exercises for a date
    //loop thru exercises array
    exercises.forEach(function(element) {
      //call renderExercise
      console.log(element);
      renderExercise(element);
    });
  };

  /*** Permanent Data Store Helper Routines ***/
  var getExercisesFromDataStore = function (date) {
    console.log('getDayExercises: ' + date.toString());
    //TODO: add code here to get  exercises from datastore

  };

  var addExerciseToDataStore = function () {
    console.log('addExercise');

  };
  var saveExerciseToDataStore = function (exercise) {
    console.log('saveExercise');

  };

  var deleteExerciseFromDataStore = function (exercise) {
    console.log('deleteExercise');
    //remove from server

  };

  /*** Local Datastore Helper Routines ***/
  var saveExercises = function(){
    //TODO: write local global array to local storage

  };

  var replaceExercise = function (exercise) {
    //return updated array of objects
    var elementPos = gExercises.map(function (x) {
      return x.exerciseID;
    }).indexOf(exercise.exerciseID);
    if (elementPos >= 0) {
      gExercises[elementPos] = exercise;
    }

    return gExercises;
  };

  var addExercise = function (exerciseType) {
    //return array with new items added to it
    var ex = __gExerciseTemplate(exerciseType);
    var set = __gSetTemplate();
    gExercises.push(ex);
    return gExercises;
  };

  var addSetToExercise = function (exercise) {
    console.log('addSetToExercise');
    //get exercise from array of exercises
    exercise = gExercises.filter(function (item) {
      return item.exerciseID === exercise.exerciseID
    });
    //add a set to the exercise object using buildSet function
    var set = __gSetTemplate();
    //fix the order of the set
    set.order = exercise.sets.length + 1;
    //save to global array of exercises
    exercise.sets[length] = set;
    //return a exercise object
    return exercise;
  };

  var removeExercise = function (exercise) {
    //returns a copy of gExercises minus exercise
    var arr;
    arr = gExercises.filter(function (item) {
      return item.exerciseID !== exercise.exerciseID;
    });

    return arr;
  };

  var removeSetFromExercise = function (exercise, setID) {
    //returns a copy of exercise minus set
    var arr = exercise.sets;
    arr = gExercises.filter(function (item) {
      return item.setID !== setID;
    });
    exercise.sets = arr;

    return arr;
  };

  var getExercise = function (exerciseID) {
    //return an object with specific exerciseID
    var arr = gExercises.filter(function (item) {
      return item.exerciseID === exerciseID;
    });

    return arr[0] || {};
  };

  var getExercises = function (exerciseDate) {
    //get array of exercises in gExercises with exerciseDate
    var arr = gExercises.filter(function (item) {
      return item.exerciseDate === exerciseDate;
    });

    return arr;
  };

  /* Route Related Routines */
  var dayChanged = function(){
    //called when the day in the calendar is changed
    //call getExercises
    //call renderExercises
  };

  /*** Init Routes ***/
  var routes = {
    '/addExercise': addExercise,
    '/addSet/:exerciseID': addSetToExercise,
    '/changeDay': addExercise
  };

  var router = Router(routes);
  router.init();

  $(document).ready(function () {
    //init the datepicker
    $('#datepick').datepicker({
      autoclose: true,
      todayHighlight: true
    });
    //set to today
    $('#datepick').datepicker('update', (new Date()).toDateString());

    console.log($('#datepick').datepicker('getFormattedDate'));
    //datepicker changed event
    $('#datepick').on('changeDate', function(){
      console.log($('#datepick').datepicker('getFormattedDate'));
    });
    //dummy calls
    if (gExercises.length === 0){
      colRpt.getData("/data/cardio-exercise.json", {}, renderExercise, renderExercise);
      colRpt.getData("/data/strength-exercise.json", {}, renderExercise, renderExercise);
      colRpt.getData("/data/hiit-exercise.json", {}, renderExercise, renderExercise);
    }
    else{
      renderExercises(gExercises);
    }

   });

})();

