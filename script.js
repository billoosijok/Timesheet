window.addEventListener('load', function() {

    // MARK: Outlets
    var timesheetContainer = document.getElementById('app');
    var signInButton = document.getElementById('sign-in');
    var signOutButton = document.getElementById('sign-out');
    var startTimeOutput = document.getElementById('startTime');
    var durationOutput = document.getElementById('duration');
    var pauseButton = document.getElementById('pause');
    var statusBar = document.getElementById('status');
    var histTable = document.getElementById('histTable');
    var historyPanel = document.getElementById('hist');
    var histMenuBar = document.getElementById("menuBar");
    var histOptionsButton = document.getElementById("optionsButton");
    var histEdit = document.getElementById("editButton");
    var downloadForm = document.getElementById("downloadForm");
    var downloadButton = document.getElementById("downloadButton");

    Timesheet({
        container: timesheetContainer,
        outlets: {
            signInButton: signInButton,
            signOutButton: signOutButton,
            startTimeOutput: startTimeOutput,
            durationOutput: durationOutput,
            pauseButton: pauseButton,
            statusBar: statusBar,
            histTable: histTable,
            historyPanel: historyPanel,
            histMenuBar: histMenuBar,
            histOptionsButton: histOptionsButton,
            histEdit: histEdit,
            downloadForm: downloadForm,
            downloadButton: downloadButton
        }
    });

    var today = new Date();
    var nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    if(document.cookie.search(/beenThere/) > -1) {
        var welcomeMessage = "Welcome back!";
    } else {
        var welcomeMessage = "Welcome!";
        document.cookie = "beenThere=true;expires=" + nextWeek;
    }
    popUpMessage(statusBar, "<img src='img/party-emoji.png'> "+welcomeMessage);
});


