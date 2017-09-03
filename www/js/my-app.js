// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var db;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

//Delete event
$$(document).on('deleted', '.remove-callback', function(){
    var workoutId = $$(this).attr('id');

    deleteWorkout(workoutId);
});


// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    db = window.openDatabase('wordkouttracker', '1.0', 'Workout Tracker', 1000000);
    createDatabase();

    getWorkouts();
});


//add page
myApp.onPageInit('add', function (page) {
    $$('#workout-form').on('submit', function(e){
        var data = {
            id : guidGenarator(),
            title : $$('#title').val(),
            date : $$('#date').val(),
            type : $$('#type').val(),
            length : $$('#length').val()
        }

        console.log(data);

        addWorkout(data); //inserisco i dati nel db
    })

})


// details page
myApp.onPageInit('details', function (page) {
 
 var workoutId = page.query.id;

 getWorkoutDetails(workoutId);

})


function createDatabase(){
    db.transaction(createTable, 
        function(tx, err){
            alert('DB ERROR', +err);
        },
        function(){
            console.log('Database and table created');
        });
}


function createTable(tx){
    //tx.executeSql('DROP TABLE IF EXISTS workouts');
    tx.executeSql('CREATE TABLE IF NOT EXISTS workouts (id unique, title, date, type, length)');
}

function addWorkout(workout){
    db.transaction(function(tx){
        tx.executeSql('INSERT INTO workouts (id, title, date, type, length) VALUES ("'+workout.id+'", "'+workout.title+'", "'+workout.date+'", "'+workout.type+'","'+workout.lenght+'")');
    },
    function(err){
        console.log(err);
    },
    function(){
        window.location.href='index.html';
    });
}

function getWorkouts(){
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM workouts ORDER BY date DESC', [],
            function(tx, results){
                //success callback
                var len = results.rows.length;
                console.log('Workouts table: '+len+' rows found');

                for(var i = 0; i<len; i++){
                    $$('#workout-list').append(`
                        <li class="swipeout remove-callback" id="${results.rows.item(i).id}">
                            <a href="details.html?id=${results.rows.item(i).id}" class="item-link swipeout-content item-content">
                                <div class="item-inner">
                                    <div class="item-title">${results.rows.item(i).title}</div>
                                    <div class="item-after">${results.rows.item(i).date}</div>
                                </div>
                            </a>
                            <div class="swipeout-actions-right">
                                <a href="#" class="swipeout-delete">Delete</a>
                            </div>
                        </li>
                    `);
                }
            },
            function(err){
                //error callback
                console.log(err);
            });
    });
}

function deleteWorkout(id){
    db.transaction(function(tx){
        tx.executeSql('DELETE FROM workouts WHERE id = "'+id+'"');   
    },
    function(err){
        console.log(err);
    },
    function(){
        console.log('Workout Deleted');
    });
}

function getWorkoutDetails(id){
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM workouts WHERE id = "'+id+'"', [],
        function(tx, result){
            $$("#workout-details").html(`

                <div class="card">
                    <div class="card-header">${result.rows[0].title}</div>
                    <div class="card-content">
                        <div class="card-content-inner">
                            <ul>
                                <li>Workout Type : ${result.rows[0].type}</li>
                                <li>Workout Length : ${result.rows[0].length}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-footer">Date : ${result.rows[0].date}</div>
                </div>
            `);
        },
        function(err){
            console.log(err);
        });
    });
}

//funzione per generare id
function guidGenarator() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

