function Timesheet(options) {

    // MARK: Properties
    var appContainer = options.container;
    var signInButton = options.outlets.signInButton;
    var signOutButton = options.outlets.signOutButton
    var startTimeOutput = options.outlets.startTimeOutput; 
    var durationOutput = options.outlets.durationOutput; 
    var pauseButton = options.outlets.pauseButton; 
    var statusBar = options.outlets.statusBar; 
    var histTable = options.outlets.histTable; 
    var historyPanel = options.outlets.historyPanel; 
    var histMenuBar = options.outlets.histMenuBar; 
    var histOptionsButton = options.outlets.histOptionsButton; 
    var histEdit = options.outlets.histEdit; 
    var downloadForm = options.outlets.downloadForm;
    var downloadButton = options.outlets.downloadButton;

    var counterInterval;
    var pauseInterval;
    var timePaused;
    var breakTime;
    var pauseDuration;

    var startTime;
    var duration;
    var finishTime;

    var lastId;

    var editingOn = false;
    var menuOn = false;



    // MARK: Events
    signInButton.addEventListener('click', function() {

        startTime = new Date();
        breakTime = 0;
        pauseInterval = false;
        pauseDuration = 0;
        timePaused = 0;
        pauseButton.innerHTML = "pause";

        startTimeOutput.style.opacity = 0;
        startTimeOutput.innerHTML = 'Started At: ' + startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        show(startTimeOutput);

        resetTimer();

        counterInterval = setInterval(function () {
            if(!pauseInterval) {
                duration = new Date() - breakTime - startTime;

                durationOutput.innerHTML = time(duration);
            } else {
                pauseDuration = pauseDuration + (new Date() - pauseDuration - timePaused);
                
            }

        }, 1000)

        signOutButton.removeAttribute('disabled');
        pauseButton.removeAttribute('disabled');
        show(signOutButton);show(pauseButton);

        signInButton.setAttribute('disabled', 'disabled');
        hide(signInButton);

        window.addEventListener('beforeunload', doubleCheck);

    });

    signOutButton.addEventListener('click', function() {

        durationOutput.innerHTML = time(duration);

        if(confirm("Save?")){
            clearInterval(counterInterval);

            var today = new Date();
            var record = createRecord(today, duration);
            saveLocally(today, duration);

            var newRecord = createHistRecord(lastId,record[0], record[1]);
            newRecordOriginalHeight = window.getComputedStyle(newRecord, null).getPropertyValue('height');
            newRecord.style.height = 0;
            histTable.insertBefore(newRecord, histTable.childNodes[0]);
            
            if(historyPanel.style.opacity <= 0) {
                show(historyPanel);
            }
            
            animate(durationOutput, 'opacity', '0', 100);
            moveElement(durationOutput, newRecord, 300, function() {
                
                updateTextContent(newRecord, newRecord.innerHTML);
                animate(newRecord, 'height', newRecordOriginalHeight);
                lastId += 1;

                setTimeout(function(){ resetTimer() }, 400);

                window.removeEventListener('beforeunload', doubleCheck);

            });

            signInButton.removeAttribute('disabled');
            show(signInButton);

            signOutButton.setAttribute('disabled', 'disabled');
            hide(signOutButton); hide(pauseButton); hide(startTimeOutput);
      }

    });

    pauseButton.addEventListener('click', function() {
        if(!pauseInterval) {
            pause();
            pauseButton.innerHTML = 'resume';
        } else {
            resume();
            pauseButton.innerHTML = 'pause';
        }
    });

    downloadForm.addEventListener('submit', function(e){
        

        var records = readHistory();
        for (var i = 0; i < records.length; i++) {
            var splitRecord = records[i].split("=");
            var formElement = document.createElement('input');
            formElement.setAttribute('type', 'hidden');
            formElement.setAttribute('name', splitRecord[0]);
            formElement.setAttribute('value', splitRecord[1]);
            downloadForm.appendChild(formElement);
        }

    });

    histOptionsButton.addEventListener('click', function() {
        if(!menuOn) {
            menuOn = true;
            animate(histMenuBar, 'right', '0', 200);
            histOptionsButton.removeClass('off');
            histOptionsButton.setAttribute('class', 'on');
            
        } else {
            menuOn = false;
            animate(histMenuBar, 'right', '-180', 200);
            histOptionsButton.setAttribute('class', 'off');
            
            if(editingOn) {
                histEdit.click();
            }
        }
    });

    histEdit.addEventListener('click', function() {
        var histDeleteButtons = document.querySelectorAll("#hist .delete button");
        if(!editingOn) {
            editingOn = true;
            for (var i = 0; i < histDeleteButtons.length; i++) {
                histDeleteButtons[i].removeAttribute('disabled');
                animate(histDeleteButtons[i], 'opacity', '1');
            }
            updateTextContent(histEdit, "Done", 'top');
        } else {
            editingOn = false;
            for (var i = 0; i < histDeleteButtons.length; i++) {
                histDeleteButtons[i].setAttribute('disabled', 'disabled');
                animate(histDeleteButtons[i], 'opacity', '0');
            }
            updateTextContent(histEdit, "Edit", 'bottom');
        }
    });

    historyPanel.addEventListener('click', function(e){
          
        if(e.target && e.target.getAttribute('role') == "delete") {
            
            if(e.target.parentElement.parentElement.nodeName == "TR") {
              var row = e.target.parentNode.parentNode;
              
              deleteRecord(row);
        } else {
          popUpMessage(statusBar, "<span class='error'><img src='img/crying-face.png'> Couldn't delete it for some reason</span>");
        }
      }
    });

    // MARK: Functions 
    // - Public
    pause = function () {
      pauseInterval = true;
      timePaused = new Date();
    }

    resume = function () {
      pauseInterval = false;
      breakTime += pauseDuration;
      pauseDuration = 0;
    }

    resetTimer = function () {
        duration = new Date(0);
        updateTextContent(durationOutput, time(duration));
    }

    showHistory = function(records) {
        // Showing the records in the History Table.
        for (var i = records.length-1; i >= 0 ; i--) {
          if(records[i].length) {
            
            var record = records[i].split("=");
            var parsedRecord = createRecord(record[0], record[1]);
            record = createHistRecord(i,parsedRecord[0], parsedRecord[1]);

            histTable.appendChild(record);
          }
        }
    }

    function time(timeInMilliS) {
        var seconds = Math.floor(timeInMilliS / 1000) ;
        var minutes = Math.floor(seconds / 60) ;
        var hour = Math.floor(minutes / 60);

        return wrapInTag(padd(hour), 'span') +
        wrapInTag(":", 'span') +
        wrapInTag(padd(minutes%60), 'span') +
        wrapInTag(":", 'span') +
        wrapInTag(padd(seconds% 60), 'span');
    }

    // - Private
    function padd(number) {
        var zeroes = 1;
        for (var i = zeroes; String(number).length <= zeroes; i--) {
            number = "0" + number;
        }

        return number;
    }

    function wrapInTag(string, tag) {
        return "<" + tag + ">" + string + "</" + tag + ">";
    }

    function parseDataObject(data) {
        var string = "";
        for (column in data) {
            string += column + "=" + data[column] + "&";
        }
        return string;
    }

    function createHistRecord(id, dateString, durationString) {
       
       var row = document.createElement('tr');
       row.setAttribute('tag', String(id));

       var cel1 = document.createElement('td');
       var cel2 = document.createElement('td');

       var deleteButton = document.createElement('button');
       deleteButton.innerHTML = "X";

       deleteButton.setAttribute('disabled', 'disabled');
       deleteButton.setAttribute('role', 'delete');

       var deleteCel = document.createElement('td');
       deleteCel.setAttribute('class', 'delete');
       deleteCel.appendChild(deleteButton);

       cel1.innerHTML = dateString;
       cel2.innerHTML = durationString;

       row.appendChild(cel1); row.appendChild(cel2); row.appendChild(deleteCel);

       return row;
    }

    function parseMillisDuration(milliseconds) {
        var seconds = Math.round(milliseconds / 1000);
        var minutes = Math.round(seconds / 60);
        var hours = Math.floor(minutes / 60);

        if(hours > 0) {
            return hours + " Hr " + (minutes % 60) + " Min";
        } else {
            return (minutes % 60) + " Min " + (seconds % 60) + " Sec";
        }
    }

    function createRecord(date, duration) {
        

        date = new Date(Number(date));
        var options = { weekday: 'short', month: 'short', day: 'numeric' };
        
        var dateString = date.toLocaleDateString('en-US', options);
        var durationString = parseMillisDuration(Number(duration));

        return [dateString, durationString];
    }

    function saveLocally(date, duration) {

        var prevRecords = "";
        var sep = "";
        if(window.localStorage.getItem('timerData')) {
            prevRecords = window.localStorage.getItem('timerData');
            sep = "&";
        }

        var key = date.getTime();
        var duration = (Number(duration)) ? duration : 0;

        window.localStorage.setItem('timerData', prevRecords+sep+String(key)+"="+String(duration)); 
        
        popUpMessage(statusBar, 'Saved <img src="img/thumbs-up.png">');
    }

    function readHistory() {

        var records = [];
        if(window.localStorage.getItem('timerData')) {
            records = window.localStorage.getItem('timerData');

            records = records.split("&");

        }
        lastId = records.length;
        return records;
    }

    function deleteRecord(rowNode) {
        
        var id = rowNode.getAttribute('tag');
        var records = readHistory();
        records.splice(id, 1);
        
        if(confirm("Sure?")) {
            window.localStorage.setItem('timerData', records.join("&"));

            animate(rowNode, 'opacity', '0')
            animate(rowNode, 'zoom', '0', 100, function(){
                rowNode.style.display = 'none';
                popUpMessage(statusBar, 'Deleted <img src="img/thumbs-up.png">')
            });

            if(!records.length) {
                hide(historyPanel);
            }
        }
    }

    function doubleCheck(e) {
        var weirdVal = "\o/"
        e.returnValue = weirdVal;
        return weirdVal;
    }

    function checkFile(file) {
        var req = makeRequest("POST", file);

        req.onload = function() {
            if(req.status == 200) {
                return true;
            }
        }

        req.onerror = function() {
            return false;
        }

        req.send(null);
    }

    function makeRequest(method, target) {
        var req = new XMLHttpRequest();
        req.open(method, target, true);

        return req;
    }

    // - TBD 

    // function sendLog(data) {
    //     
    //     var req = makeRequest("POST", "addRecord.php");
    //     var data = parseDataObject(data);

    //     

    //     req.onprogress = function() {
    //         updateTextContent(statusBar, '<img src="img/loading.gif"> Saving ... <img src="img/loading-emoji.png">');
    //     }

    //     req.onload = function() {
    //         if(req.status == 200) {
    //             popUpMessage(statusBar, '<img src="img/check.png"> Saved.');
                
    //         } else {
    //             // var errorMsg = '<span class="error"> <img src="img/crying-face.png"> Connection Error.</span>';
    //             // updateTextContent(statusBar, errorMsg);
    //         }
    //     }

    //     req.onerror = function() {
    //         var errorMsg = '<span class="error"> <img src="img/crying-face.png"> Connection Error.</span>';
    //         updateTextContent(statusBar, errorMsg);
    //     }

    //     req.send(null);
    // }

    // MARK: Setup
    function init() {
        
        var oldRecords = readHistory();
        
        if(oldRecords.length) {
            /* If there are records, that means the user has already been here! */ 
            showHistory(oldRecords);

            if(checkFile("download.php") === false) {
                downloadButton.setAttribute('disabled', 'disabled');
                downloadButton.setAttribute('title', 'Connection is unavailable');
            } 

        } else {
            // Hiding history table
            historyPanel.style.opacity = 0;
            signInButton.innerHTML = "&nbsp;";
            setTimeout(function() {updateTextContent(signInButton, 'Start')}, 2500);
        }

        appContainer.style.opacity = 0;
        appContainer.style.position = 'relative';
        appContainer.style.top = '40px';

        animate(appContainer, 'top', '0', 300);
        animate(appContainer, 'opacity', '1', 400);

        HTMLElement.prototype.addClass = function(className) {
            var classes = this.getAttribute('class');
            this.setAttribute('class', classes + " " + className);
        };

        HTMLElement.prototype.removeClass = function(className) {
            var classes = className.slice(" ");
            var existing_classes = this.getAttribute('class');
            
            // for (var i = 0; i < classes.length; i++) {
            //     existing_classes.replace(className[i], "");
            // }
            // this.setAttribute('class', existing_classes);
        };

        HTMLElement.prototype.hasClass = function(className) {
            var classes = className.slice(" ");
            var existing_classes = this.getAttribute('class');
            
            for (var i = 0; i < classes.length; i++) {
                var regex = new RegExp("\b"+classes[i]+"\b");
                
                if(!regex.test(existing_classes)) {
                    return false;
                }
            }
            return true;
        };

        HTMLElement.prototype.toggleClass = function(className) {
            var classes = className.slice(" ");
            var existing_classes = this.getAttribute('class');
            
            for (var i = 0; i < classes.length; i++) {
                if(this.hasClass(classes[i])) {
                    this.removeClass(classes[i]);
                } else {
                    this.addClass(classes[i]);
                }
            }
            
        };
    }

    init();
}
