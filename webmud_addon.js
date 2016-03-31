/*****************************************************************************\
| Form injection code, uses jquery                                            |
\*****************************************************************************/
'use strict';

//Add some elements so the user can select paths and options
$("<div id='pathAndLoop' class='panel col-xs-12 col-lg-8' style='padding:10px;float:left;margin-bottom:10px'>\
  <p>Pathing and Looping</p>\
  <p>Select a starting and ending room then choose Walk or Run</p>\
  <div id='roomSelect' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
    <p>Starting Room / Loop</p>\
    Group: <select id='startGroupSelect' onchange=\"groupSelected('startGroupSelect','startPathSelect')\" style='width:225px;'></select>\
    <br />Room: <select id='startPathSelect' onchange='displayPath()' style='width:225px;'></select>\
    <br /><br /><p>Ending Room (n/a for loops)</p>\
    Group: <select id='endGroupSelect' onchange=\"groupSelected('endGroupSelect','endPathSelect')\" style='width:225px;'></select>\
    <br />Room: <select id='endPathSelect' onchange='displayPath()' style='width:225px;'></select>\
  </div>\
  <div id='pathControls' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
    <button id='pathWalk' class='btn btn-default' onclick=\"lookupPathAndMove('startPathSelect','endPathSelect','stepDelay',false,false)\">Walk</button>\
    <button id='pathRun'class='btn btn-default' onclick=\"lookupPathAndMove('startPathSelect','endPathSelect','stepDelay',true,false)\">Run</button>\
    <button class='btn btn-danger' onclick=\"stopWalking('now')\">STOP!</button>\
    <br />\
    <button id='pathLoop'class='btn btn-default' onclick=\"lookupPathAndMove('startPathSelect','endPathSelect','stepDelay',false,true)\">Loop</button>\
    <button class='btn btn-danger' onclick=\"stopWalking('end of loop')\">End Loop</button>\
    <br />Fine tune step delay (ms):\
    <input type='number' id='stepDelay' name = 'stepDelay' min='1' value='2500' style='width:60px;'/>\
  </div>\
  <div id='autoCommands' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
    <p>Auto Commands</p>\
    <p>Enter a command and frequency below. Seperate multiple commands with a comma. Toggle sending on/off with the checkbox.</p>\
    <p>Send auto commands:\
      <input type='checkbox' id='sendAutoCmds' onchange=\"autoCmdCheck('autoCmd','autoCmdDelay','sendAutoCmds')\")/>\
    </p>\
    <p>Command(s):\
      <input type='text' id='autoCmd' style='width:150px' value='' />\
    </p>\
    <p>Delay (sec):\
      <input type='number' id='autoCmdDelay' name = 'autoCmdDelay' min='1' value='6' style='width:50px;'/>\
    </p>\
  </div>\
</div>\
<div id='Path Management' class='panel col-xs-12 col-lg-8' style='padding:10px;float:left;margin-bottom:10px'>\
  <div id='pathCreate' class='panel col-xs-12 col-lg-6' style='padding:10px;float:left;margin-bottom:10px'>\
    <p>Path and Loop Creation</p>\
    <p>Create a new path/loop by filling in the boxes below. Spaces will be removed.</p>\
    <p>Starting room / Loop name:\
      <input type='text' id='startingRoom' style='width:150px;' value='Start_Room_Name' />\
    </p>\
    <p>Ending room (n/a for loops):\
      <input type='text' id='endingRoom' style='width:150px;' value='End_Room_Name' />\
    </p>\
    <p>Enter the steps for the path below, seperated by commas (n,s,e,w,ne,se,sw,nw,u,d):\
      <br /><textarea id='newPath' rows='5' cols='40'></textarea>\
    </p>\
    <p>\
      <button class='btn btn-default' onclick=\"newPath('CustomPaths_','path')\">Save Path</button>\
      <button class='btn btn-default' onclick=\"newPath('CustomPaths_','loop')\">Save Loop</button>\
      <button type='button' class='btn btn-success' style='float:right' data-toggle='modal' data-target='#importExportDialog'>Import/Export</button>\
    </p>\
  </div>\
  <div id='pathGrouping' class='panel col-xs-12 col-lg-6' style='padding:10px;float:left;margin-bottom:10px'>\
    <p>Path grouping</p>\
    <p>Select a group from the dropdown box and add/remove paths. Note, paths are grouped based on the starting room.</p>\
    <p>Select Group:&nbsp&nbsp\
      <select id='groupingGroupSelect' class='groupSelect' onchange=\"groupSelected('groupingGroupSelect','groupingCurPathSelect')\" style='width:225px;'></select>\
    </p>\
    <p>Current paths:&nbsp\
      <select id='groupingCurPathSelect' style='width:225px;'></select>\
    </p>\
    <p>All Paths:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp\
      <select id='groupingAllPathSelect' class='pathSelect' style='width:225px;'></select>\
    </p>\
    <p>\
      <button class='btn btn-default' onclick=\"editGroup('new')\">New Group</button>\
      <button class='btn btn-default' onclick=\"editGroup('add')\">Add Path</button>\
      <button class='btn btn-default' onclick=\"editGroup('remove')\">Remove Path</button>\
    </p>\
    <p>\
      <button class='btn btn-default' onclick=\"editGroup('delete')\">Delete Group</button>\
      <button class='btn btn-default' onclick=\"deleteSelectedPath('CustomPaths_','groupingAllPathSelect','pathGroups_')\">Delete Path</button>\
    </p>\
  </div>\
</div>\
").insertAfter("#divExpTimer");

//Div for addon status
$("<div id='addonStatus'>\
<p>Addon Status: <label id=\"addonStatusText\"></label></p>\
</div>").insertAfter("#mainScreen");

//Modal dialog for path import/export
$("<div id='importExportDialog' class='modal fade' tabindex='-1' role='dialog' aria-labelledby='pathImportExport'>\
  <div class='modal-dialog'>\
    <div class='modal-content'>\
      <div class='modal-header'>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>\
        <h4 class='modal-title'>Path Import and Export Tools</h4>\
      </div>\
      <div class='modal-body'>\
        <p style='font-size:12px'>The following buttons and box will let you import and export paths. Special formatting is required for import so be careful when using this ability and only paste paths from a known good source.  To import, paste a single, group, or mass path list into the box and click Import. For export, use the single, group, or all buttons. Single will export only the currently selected path, Group will export all paths in the selected group, and All will export all paths/groups.</p>\
        Group: <select id='exportGroupSelect' class='groupSelect'></select><br />\
        Path: <select id='exportPathSelect' class='pathSelect'></select><br />\
        <textarea id='pathImportExport' rows='5' cols='70' style='max-width:550px'></textarea>\
      </div>\
      <div class='modal-footer'>\
        <div style='margin:0 auto'>\
          <button type='button' id='importPath' class='btn btn-success' data-dismiss='modal' style='float:left'>Import</button>\
        </div>\
        <div style='margin:0 auto; width:40%'>\
          <button type='button' id='exportSingle' class='btn btn-primary' style='float:left'>Single</button>\
          <button type='button' id='exportGroup' class='btn btn-primary' style='float:left'>Group</button>\
          <button type='button' id='exportAll' class='btn btn-primary' style='float:left'>All</button>\
        </div>\
        <div style='margin:0 auto'>\
          <button type'button' id='clearAllPaths' class='btn btn-danger'>Clear All Paths</button>\
          <button type='button' class='btn btn-danger' data-dismiss='modal'>Close</button>\
        </div>\
      </div>\
    </div>\
  </div>\
</div>").insertAfter("#divCharacterSetup")

//Constants used across many functions
const START_PATH_SELECT_ID = 'startPathSelect';
const END_PATH_SELECT_ID = 'endPathSelect'
const START_GROUP_SELECT_ID = 'startGroupSelect';
const END_GROUP_SELECT_ID = 'endGroupSelect'
const PATH_LIST = 'CustomPaths_';
const GROUP_LIST = 'pathGroups_';

//Global variables used to manage player state
let inCombat = false;
let playerMoving = false;
let playerResting = false;
let aiRunning = false;
let stopWalkingFlag = '';
let sendAutoCmds = false;
let lastSwingTime = Date.now();
let combatEndTime = Date.now();
let curPlayer;


/*****************************************************************************\
| Classes                                                                     |
\*****************************************************************************/

class Player {
  constructor(id, friends, settings) {
    this._id = id;

    if (friends) {
      this._friends = friends;
    } else {
      this._friends = new Array();
    }

    this._settings = {
      'curPaths':{'startGroup':'_All_Paths', 'endGroup':'_All_Paths',
                  'startPath':'', 'endPath':''},
      'stepDelay':2500,
      'autoCmds':{'commands':'', 'delay':6, 'enabled':false}
    };

    if (settings) {
      if (settings.curPaths) {
        this._settings.curPaths = settings.curPaths;
      }

      if (settings.stepDelay) {
        this._settings.stepDelay = settings.stepDelay;
      }

      if (settings.autoCmds) {
        this._settings.autoCmds = settings.autoCmds;
      }
    }
  }

  savePlayer() {
    localStorage.setItem(this._id, JSON.stringify(this));
  }

  addFriend(friend) {
    this._friends.push(friend);

    this.savePlayer();
  }

  removeFriend(enemy) {
    let i = this._friends.length;
    while (i--) {
      if (this._friends[i] === enemy) {
        this._friends.splice(i,1);
      }
    }
  }

  isFriend(name) {
    if (this._friends.indexOf(name) !== -1) {
      return true;
    } else {
      return false;
    }
  }

  updateSettings() {
    //selected paths
    this._settings.curPaths.startGroup = document.getElementById(START_GROUP_SELECT_ID).value;
    this._settings.curPaths.endGroup = document.getElementById(END_GROUP_SELECT_ID).value;
    this._settings.curPaths.startPath = document.getElementById(START_PATH_SELECT_ID).value;
    this._settings.curPaths.endPath = document.getElementById(END_PATH_SELECT_ID).value;

    //step delay
    this._settings.stepDelay = document.getElementById('stepDelay').value;

    //auto command settings
    this._settings.autoCmds.commands = document.getElementById('autoCmd').value;
    this._settings.autoCmds.delay = document.getElementById('autoCmdDelay').value;
    this._settings.autoCmds.enabled = document.getElementById('sendAutoCmds').checked;

    this.savePlayer();
  }

  loadSettings() {
    //selected groups
    selectIfExists(this._settings.curPaths.startGroup, START_GROUP_SELECT_ID);
    selectIfExists(this._settings.curPaths.endGroup, END_GROUP_SELECT_ID);
    //reload selectors after selecting grops so paths are available
    reloadSelectors();
    //selected paths
    selectIfExists(this._settings.curPaths.startPath, START_PATH_SELECT_ID);
    selectIfExists(this._settings.curPaths.endPath, END_PATH_SELECT_ID);

    //step delay
    document.getElementById('stepDelay').value = this._settings.stepDelay;

    //auto commands
    document.getElementById('autoCmd').value = this._settings.autoCmds.commands;
    document.getElementById('autoCmdDelay').value = this._settings.autoCmds.delay;
    document.getElementById('sendAutoCmds').checked = this._settings.autoCmds.enabled;
  }
}


/*****************************************************************************\
| Initialization code (self invoked)                                          |
\*****************************************************************************/

(function() {
  //used to load all of the initial data stored in localStorage
  let custPaths = localStorage.getItem(PATH_LIST);
  let groupList = localStorage.getItem(GROUP_LIST);

  //Save a starter path list if none currently exists
  if (custPaths === null) {
    storePath(PATH_LIST,'');
    custPaths = localStorage.getItem(PATH_LIST);
  }
  //Save a starter group list if none currently exists
  if (groupList === null) {
    storePath(GROUP_LIST,'_All_Paths');
  }

  //Overwrite the _All_Paths group with the current list of all paths
  //from localStorage.
  storePath('_All_Paths',custPaths);

  //load the selectors
  reloadSelectors();

  //create the player object
  let storedPlayer = JSON.parse(localStorage.getItem(playerID));

  if (storedPlayer) {
    curPlayer = new Player(playerID, storedPlayer._friends, storedPlayer._settings);
  } else {
    curPlayer = new Player(playerID);
  }

  //load the player's saved settings
  curPlayer.loadSettings();

  //start or stop auto commands after loading preferences
  autoCmdCheck('autoCmd','autoCmdDelay','sendAutoCmds');

  //alert the player that the addon loaded successfully
  notifyPlayer('yellow','WebMUD addon successfully loaded');

})();


/*****************************************************************************\
| Path walking / looping code                                                 |
\*****************************************************************************/

function lookupPathAndMove(startSelectId, endSelectId, delaySelectId, runPath, loopPath) {
  let start = document.getElementById(startSelectId).value;
  let end = document.getElementById(endSelectId).value;
  let stepDelay = document.getElementById(delaySelectId).value;

  //make sure the stopWalkingFlag is blank to start
  stopWalkingFlag = '';

  if (loopPath) {
    let path = localStorage.getItem(start);
    //start the path
    walkPath(path, stepDelay, loopPath, start);
    //tell the player
    notifyPlayer('greenyellow', 'Looping of ' + start + ' started.');
    //disable movement buttons to prevent multiple clicks
    toggleMoveButtons(false);

  } else {
    //for not loops, find the shortest path and build the step string
    let path = findPath(start, end);

    if (path) {
      let steps = buildPath(path);

      //if the player want to run (no combat), disable AI combat
      if (runPath) {
        sendMessageDirect('DisableAI Combat');
        document.getElementById('chkAICombat').checked = false;
      }

      //start the path
      walkPath(steps, stepDelay, loopPath, start);
      //tell the player
      notifyPlayer('greenyellow', 'Walking path: ' + path.split(',').join(' => '));
      //disable movement buttons to prevent multiple clicks
      toggleMoveButtons(false);

      //reverse the selected start/end group and path for quality of life
      switchPathSelection();

    } else {
      let displayString = 'ERROR: No path found between ' + start + ' and ' + end;
      document.alert(displayString);
    }
  }

  //save the player's current settings
  curPlayer.updateSettings();
}

function walkPath(path, stepDelay, loopPath, selectedPath) {
  let pathArray = path.split(',');
  let genObj = genFunc(pathArray);

  let interval = setInterval(() => {
    //The following if statement checks a bunch of boolians so I use 'not' logic
    //which lets me keep the line short
    if (
        !(inCombat || playerMoving || playerResting || aiRunning)
        && ((combatEndTime + 1000) < Date.now())
      ) {

      //get the next step
      let val = genObj.next();

      //if the path is done
      if (val.done || stopWalkingFlag === 'now') {
        //stop the timed interval since the path is done
        clearInterval(interval);
        //enable the movement buttons
        toggleMoveButtons(true);

        //Determine the reason or stopping and notify the player
        if (loopPath && stopWalkingFlag === '') {
          //if the player wants to loop, recall the function using the
          //same conditions
          notifyPlayer('greenyellow', 'Loop Complete, re-looping ' + selectedPath);

          walkPath(path, stepDelay, loopPath, selectedPath);

        } else if (stopWalkingFlag === 'now') {
          //if the player asked to stop now, stop and alert them
          genObj = null;  //reset the generator
          notifyPlayer('red', 'WALKING/LOOPING STOPPED NOW!');
          stopWalkingFlag = '';

        } else if (stopWalkingFlag === 'end of loop') {
          //if the player was looping but wanted to stop at the end of the
          //current loop, stop and let them know the current loop is done
          notifyPlayer('yellow', 'STOPPED: end of current loop');
          stopWalkingFlag = '';

        } else {
          //send a message to player telling them the path is complete
          notifyPlayer('lime', 'Path complete, you have arrived');
          stopWalkingFlag = '';
          //re-enable combat in case the user was running the path
        }

        //re-enable combat if it was disabled for a run
        sendMessageDirect('EnableAI Combat');
        document.getElementById('chkAICombat').checked = true;

      } else {
        //Send the next step
        sendMessageDirect(val.value);
      }
    } else {
      //check for combat inactivity where combat is set to true but a swing
      //hasn't happened for a least 10000 miliseconds (10 seconds)
      if (inCombat === true && (lastSwingTime + 10000) < Date.now()) {
        inCombat = false;
        //reset swing timer so combat doesn't disable right away
        lastSwingTime = (Date.now() + 10000);
      }
    }
  }, stepDelay);
}

function* genFunc(passedArr) {
  let Arr = passedArr
  for(let item of Arr) {
    yield item;
  }
}

function stopWalking(whenToStop) {
  stopWalkingFlag = whenToStop;
}

function switchPathSelection() {
  let curStartGroup = document.getElementById(START_GROUP_SELECT_ID).value;
  let curEndGroup = document.getElementById(END_GROUP_SELECT_ID).value;
  let curStartRoom = document.getElementById(START_PATH_SELECT_ID).value;
  let curEndRoom = document.getElementById(END_PATH_SELECT_ID).value;

  //swap the groups start <> end
  selectIfExists(curStartGroup, END_GROUP_SELECT_ID);
  selectIfExists(curEndGroup, START_GROUP_SELECT_ID);
  //reload selectors so paths are available
  reloadSelectors();
  //swap the paths start <> end
  selectIfExists(curStartRoom, END_PATH_SELECT_ID);
  selectIfExists(curEndRoom, START_PATH_SELECT_ID);

}

/*****************************************************************************\
| Path creation code                                                          |
\*****************************************************************************/

function newPath(pathList, pathType) {
  let custPaths = localStorage.getItem(pathList);
  let startingRoom = removeSpaces(document.getElementById('startingRoom').value);
  let endingRoom = removeSpaces(document.getElementById('endingRoom').value);
  let newPath = removeSpaces(document.getElementById('newPath').value);

  if (pathType === 'path') {
    //todo add reverser split.reverse.join
    let newPathName = startingRoom + '__2__' + endingRoom;
    let newPathNameReverse = endingRoom + '__2__' + startingRoom;
    let newPathReverse = reversePath(newPath);

    custPaths = custPaths + ',' + newPathName + ',' + newPathNameReverse;
    storePath(pathList, custPaths);
    storePath(newPathName, newPath);
    storePath(newPathNameReverse, newPathReverse);

  } else if (pathType === 'loop') {

    let newLoopName = 'loop_' + startingRoom;

    custPaths = custPaths + ',' + newLoopName;
    storePath(pathList, custPaths);
    storePath(newLoopName, newPath);
  }

  //clear the boxes for the next path
  document.getElementById('startingRoom').value = '';
  document.getElementById('endingRoom').value = '';
  document.getElementById('newPath').value = '';

  //Update the _All_Paths group
  storePath('_All_Paths', custPaths);

  //reload selectors with the new paths
  reloadSelectors();


  //alert the user that the path saved successfully
  notifyPlayer('yellow', 'New path/loop saved');
}

/*****************************************************************************\
| Path tools                                                                  |
\*****************************************************************************/

function deleteSelectedPath(pathList, pathSelectId, groupList) {
  let pathToDelete = document.getElementById(pathSelectId).value;
  let groupListArray = localStorage.getItem(groupList).split(',');

  let playerConfirm = window.confirm("Are you sure you want to delete " + pathToDelete + "?");

  if (playerConfirm) {
    removePathFromGroups(pathList, pathToDelete);

    //loop through all groups and remove the path if found
    groupListArray.forEach(function(group) {
      removePathFromGroups(group, pathToDelete);
    });

    //delete the associated path from local storage
    localStorage.removeItem(pathToDelete);

    //reload the path list
    reloadSelectors();

    //notify the player
    notifyPlayer('red','Path ' + pathToDelete + ' successfully deleted');
  }
}

function removePathFromGroups(pathList, pathToDelete) {
  let custPaths = localStorage.getItem(pathList);
  let custPathsArray = custPaths.split(',');
  let i = custPathsArray.length;
  let startingLength = custPathsArray.length;

  //Loop through the array and remove the selected path
  while (i--){
    if (custPathsArray[i] === pathToDelete) {
      custPathsArray.splice(i,1);
    }
  }

  //put the array back together into a string
  custPaths = custPathsArray.join(',');

  //if the new array is shorter than the original, meaning a path was deleted
  //then write it to local storage
  if (custPathsArray.length < startingLength) {
    storePath(pathList, custPaths);
  }
}

function getPathsToImport(pathList, groupList) {
  let importConfirm = window.confirm('Are you sure you want to import the \
  paths from the textbox below?');

  if (importConfirm) {
    let pathImportList = document.getElementById('pathImportExport').value;
    importPaths(pathList, groupList, pathImportList);
  }

  //clear the import box
  document.getElementById('pathImportExport').value = '';
}

function importPaths(pathList, groupList, pathsToImport) {
  let pathsToImportArray = pathsToImport.split(';');
  let currentPaths = localStorage.getItem(pathList);
  let currentGroups = localStorage.getItem(groupList);
  let currentPathsArray = currentPaths.split(',');
  let currentGroupsArray = currentGroups.split(',');
  let processGroups = false;

  pathsToImportArray.forEach(function(path) {
    if (path === '__STARTING_GROUPS__') {
      processGroups = true;

    } else {

      let pathArray = path.split(':');
      storePath(pathArray[0], pathArray[1]);

      if (processGroups) {
        currentGroupsArray.push(pathArray[0]);
      } else {
        currentPathsArray.push(pathArray[0]);
      }

    }

  });

  //remove dupe path names before writing by converting the array to a
  //set then using the spread operator to change it back and finally
  //joining it back together as a comma seperated string
  let uniqPaths = [...new Set(currentPathsArray)];
  currentPaths = uniqPaths.join(',');
  let uniqGroups = [...new Set(currentGroupsArray)];
  currentGroups = uniqGroups.join(',');

  storePath(pathList, currentPaths);
  storePath(groupList, currentGroups);

  //update the _All_Paths group
  storePath('_All_Paths', currentPaths);

  //update the path selector and alert the user import is complete
  reloadSelectors();
  notifyPlayer('greenyellow','Path import complete');
}

function exportPaths(pathList, groupList, exportType) {
  let pathsToExport = new Array();
  let exportString = '';

  if (exportType === 'single') {
    let path = document.getElementById('exportPathSelect').value;
    let pathSteps = localStorage.getItem(path);
    pathsToExport.push(path + ':' + pathSteps);

  } else {

    let currentGroups = '';
    let currentPaths = '';
    let currentGroupsArray = new Array();
    let currentPathsArray = new Array();


    if (exportType === 'group') {
      currentGroups = document.getElementById('exportGroupSelect').value;
      currentGroupsArray = currentGroups.split(',');
      currentPaths = localStorage.getItem(currentGroups);
      currentPathsArray = currentPaths.split(',');

    } else if (exportType === 'all') {
      currentPaths = localStorage.getItem(pathList);
      currentPathsArray = currentPaths.split(',');
      currentGroups = localStorage.getItem(groupList);
      currentGroupsArray = currentGroups.split(',');
    }

    currentPathsArray.forEach(function(path) {
      let pathSteps = localStorage.getItem(path);
      pathsToExport.push(path + ':' + pathSteps);
    });

    //add indicator for the start of groups
    pathsToExport.push('__STARTING_GROUPS__');

    currentGroupsArray.forEach(function(group) {
      let groupPaths = localStorage.getItem(group);
      pathsToExport.push(group + ':' + groupPaths);
    });
  }

  //Join the array back together into a string for export
  exportString = pathsToExport.join(';');

  document.getElementById('pathImportExport').value = exportString;

  window.alert('Export complete: copy the text in the box below');
}

function storePath(pathKey, pathValue) {
  localStorage.setItem(pathKey, pathValue);
}


function clearAllPaths(pathList, groupList){
  let pathListArray = localStorage.getItem(pathList).split(',');
  let groupListArray = localStorage.getItem(groupList).split(',');

  let playerConfirm = window.confirm('Are you sure you want to delete ALL paths and groups?');

  if (playerConfirm) {
    //delete all of the paths
    pathListArray.forEach(function(path) {
      //delete the associated path from local storage
      localStorage.removeItem(path);
    });
    //delete all of the groups
    groupListArray.forEach(function(group) {
      //delete the associated path from local storage
      localStorage.removeItem(group);
    });
    //Remove all paths from the CustomPaths_ list and _All_Paths list
    localStorage.setItem('_All_Paths','');
    localStorage.setItem('CustomPaths_','');
    localStorage.setItem('pathGroups_','_All_Paths');
  }

  //reload the path list
  reloadSelectors();

  //notify the player
  notifyPlayer('red','ALL paths successfully deleted');
}


function reversePath(dir) {
  let revDir = '';

  //loop through the array and replace directions with their opposites
  //only n,s,e,w,u,d are needed because each character is evaluated so
  //se becomes nw
  for (let i = 0; i < dir.length; i++) {
    switch (dir[i]) {
      case 'n':
        revDir += 's';
        break;
      case 's':
        revDir += 'n';
        break;
      case 'e':
        revDir += 'w';
        break;
      case 'w':
        revDir += 'e';
        break;
      case 'u':
        revDir += 'd';
        break;
      case 'd':
        revDir += 'u';
        break;
      default:
        revDir += dir[i];
        break;
    }
  };

  //combine the replacement list then reverse it for the correct order and
  //return the results
  return revDir.split(',').reverse().join();
}

/*****************************************************************************\
| Auto command code                                                           |
\*****************************************************************************/

function autoCmdCheck(cmdBox, delayId, cmdCheckBox) {
  //When the user clicks the auto commands checkbox, check to see if it's
  //checked or unchecked and set the appropriate flag
  let cmdDelay = document.getElementById(delayId).value;
  let commands = document.getElementById(cmdBox).value;

  if (document.getElementById(cmdCheckBox).checked) {
    sendAutoCmds = true;
    startAutoCmds(commands, cmdDelay * 1000);

  } else {
    sendAutoCmds = false;

  }

  //update the player with new commands
  curPlayer.updateSettings();
}

function startAutoCmds(commands, cmdDelay) {
  let commandArray = commands.split(',');

  let interval = setInterval(() => {
    if (sendAutoCmds) {
      commandArray.forEach(function(cmd) {
        sendMessageDirect(cmd);
      });
    } else {
      //stop auto commands once the checkbox is unchecked
      clearInterval(interval);
      notifyPlayer('yellow','Auto Commands Stopped');
    }
  }, cmdDelay);

  //tell the player commands started
  notifyPlayer('yellow','Auto Commands Started');
}


/*****************************************************************************\
| Path grouping code                                                          |
\*****************************************************************************/

function editGroup(editType) {
  let selectedGroup = document.getElementById('groupingGroupSelect').value;
  let pathToRemove = document.getElementById('groupingCurPathSelect').value;
  let pathToAdd = document.getElementById('groupingAllPathSelect').value;

  if (editType === 'new') {
    newGroup();

  } else if (selectedGroup === '_All_Paths') {
    //Check if the user is trying to modify _All_Paths
    window.alert('Modifying the _All_Paths group is not allowed');

  } else {
    //In all other cases, modify the group selected
    if (editType === 'add') {
      addToGroup(selectedGroup, pathToAdd);
    } else if (editType === 'remove') {
      removeFromGroup(selectedGroup, pathToRemove);
    } else if (editType === 'delete') {
      deleteGroup(selectedGroup);
    }
  }
}

function addToGroup(selectedGroup, pathToAdd) {
  let selectedGroupPaths = localStorage.getItem(selectedGroup);
  //add the path to the selected group's paths and save to a variable
  let updatedPaths = selectedGroupPaths + ',' + pathToAdd;
  //write the updated path list to the group
  storePath(selectedGroup, updatedPaths);

  //alert the player
  notifyPlayer('lime', pathToAdd + ' added to group ' + selectedGroup);
  //reload all of the selection lists
  reloadSelectors();
}

function removeFromGroup(selectedGroup, pathToRemove) {
  let selectedGroupPaths = localStorage.getItem(selectedGroup);
  let groupPathsArray = selectedGroupPaths.split(',');
  let i = groupPathsArray.length;

  //loop through the array and remove the path
  while (i--){
    if (groupPathsArray[i] === pathToRemove) {
      groupPathsArray.splice(i,1);
    }
  }

  //rejoin the array
  selectedGroupPaths = groupPathsArray.join(',');

  //write the updated path list back to local storage
  storePath(selectedGroup, selectedGroupPaths);

  //alert the player
  notifyPlayer('yellow', pathToRemove + ' removed from group ' + selectedGroup);

  //reload all of the selection lists
  reloadSelectors();
}

function newGroup() {
  let groupToAdd = window.prompt('Please enter a name for your new group');
  let groupList = localStorage.getItem(GROUP_LIST);

  if (groupToAdd) {
    //Clean the new name, add it to the current group list, and write out to
    //local storage
    groupToAdd = removeSpaces(groupToAdd);
    groupList += ',' + groupToAdd;
    storePath(GROUP_LIST, groupList);

    //Add a blank group under the new name to local storage
    storePath(groupToAdd, '');

    //reload selectors
    reloadSelectors();

    notifyPlayer('lime', 'New group ' + groupToAdd + ' successfully added');
  }
}

function deleteGroup(groupToDelete) {
  let groupList = localStorage.getItem(GROUP_LIST);
  let groupListArray = groupList.split(',');
  let i = groupListArray.length;

  //Ask the player if they're sure
  let playerConfirm = window.confirm("Are you sure you want to delete " + groupToDelete + "?");

  if (playerConfirm) {
    //Loop through the array and remove the selected path
    while (i--){
      if (groupListArray[i] === groupToDelete) {
        groupListArray.splice(i,1);
      }
    }

    //put the array back together into a string and write the
    //modified group   list to localstorage
    groupList = groupListArray.join();
    storePath(GROUP_LIST, groupList);

    //delete the associated path from local storage
    localStorage.removeItem(groupToDelete);

    //reload the group lists
    reloadSelectors();

    //notify the player
    notifyPlayer('red', 'Group ' + groupToDelete + ' successfully deleted');
  }
}

function saveGroup() {
  let pathTextArea = document.getElementById('pathTextArea').value;
  let pathGroupName = document.getElementById('pathGroupName').value;
  let newGroup = document.getElementById('newGroup').checked;
  let newChain = document.getElementById('newChain').checked;
  let custPaths = localStorage.getItem(PATH_LIST);

  if (!pathTextArea) {
    alert('Path list is blank. Try adding some paths first.');
  } else if (!pathGroupName) {
    alert('Path group name is blank. Add one and try again');
  } else {
    //Clean up the name/path before storing
    pathGroupName = removeSpaces(pathGroupName);
    pathTextArea = removeSpaces(pathTextArea);

    //prepend a (+) for a group or (c) for a chain
    if (newGroup) {
      pathGroupName = '\(g\)' + pathGroupName;
    } else if (newChain) {
      pathGroupName = '\(c\)' + pathGroupName;
    }

    //write the new path group/chain to local storage
    storePath(pathGroupName, pathTextArea);

    //add the new group/chain to the group paths list
    custPaths += ',' + pathGroupName;
    storePath(GROUP_LIST, custPaths);

    //reload the group and paths dropdown
    reloadSelectors();

    //clear the boxes for the next path
    document.getElementById('pathTextArea').value = '';
    document.getElementById('pathGroupName').value = '';

    //tell the player the new group/chain has been added
    notifyPlayer('green','New path group/chain added');
  }
}


/*****************************************************************************\
| Pathfinding Code                                                            |
| Note: uses code in the other authors section for Dijkstra algorithm         |
\*****************************************************************************/

function displayPath() {
  let start = document.getElementById(START_PATH_SELECT_ID).value;
  let end = document.getElementById(END_PATH_SELECT_ID).value;

  let pathString = findPath(start, end);

  if (pathString) {
    let pathArray = pathString.split(',');
    let steps = 0;
    let displayString = '';

    pathArray.forEach(function(path) {
      let pathSteps = localStorage.getItem(path).split(',');
      steps += pathSteps.length;
      displayString += ' => ' + path;
    });

    displayString = 'Path found (' + steps +' steps): ' + displayString.slice(4);
    notifyPlayer('green', displayString);
  } else {
    let displayString = 'No path found between ' + start + ' and ' + end;
    notifyPlayer('yellow', displayString);
  }
}

function buildPath(pathString) {
  let pathArray = pathString.split(',');
  let pathSteps = '';

  pathArray.forEach(function(path) {
    let steps = localStorage.getItem(path);
    pathSteps += steps + ',';
    //add a comma at the end to allow seperation with the next path
  });

  //clip the last comma off the string since there isn't another connection
  pathSteps = pathSteps.slice(0, -1);
  return pathSteps;
}

function findPath(startRoom, endRoom) {
  let pathMap = buildPathMap();
  let graph = new Graph(pathMap);
  let path = graph.findShortestPath(startRoom, endRoom);
  let pathName = new Array();

  if (path) {
    //reconstruct the path names from start/ending rooms
    for (let i = 0; i < (path.length - 1); i++) {
      pathName.push(path[i] + '__2__' + path[i + 1]);
    }
    //return a comma seperated string of actual paths in the found path
    return pathName.join(',');

  } else {
    //if no path could be found, return null
    return null;
  }
}

/*
  function to build a path map of all existing paths that is passed to a
  pathfinding function
*/
function buildPathMap() {
  let pathArray = localStorage.getItem('CustomPaths_').split(',');
  let connectGraph = new Object();
  let startRoomArray = new Array();

  //Get all starting rooms
  pathArray.forEach(function(path) {
    let rooms = path.split('__2__');
    if (rooms[1]) {
      startRoomArray.push(rooms[0]);
    }
  });
  //pull a list of only unique starting rooms which are used as nodes
  let uniqRooms = [...new Set(startRoomArray)];

  //go through each of the unique rooms, find connecting nodes, and write to
  //an object with the node as an object property then the connections and
  //distance (in steps) as sub properties of the node
  uniqRooms.forEach(function(room) {
    //omit null rooms if they exist
    if (room) {
      let connections = new Object();
      pathArray.forEach(function(path) {
        //omit null paths if they exist
        if (path) {
          //split the path name into starting and ending room
          let node = path.split('__2__');
          //find the distance bettween the nodes by counting path steps
          let distance = localStorage.getItem(path).split(',').length;
          //omit loops by checking for null ending nodes
          if (node[1]) {
            if (room === node[0]) {
              //write sub property to an object for later merging
              connections[node[1]] = distance;
            }
          }
        }
      });
      //merge in sub properties to the main node
      connectGraph[room] = connections
    }
  });

  return connectGraph;
}


/*****************************************************************************\
| General functions                                                           |
\*****************************************************************************/

function notifyPlayer(msgColor, msgText) {
  //Used to alert the player by appending messages to the main window
  let status = document.getElementById('addonStatusText');
  status.style = "color:" + msgColor
  status.innerHTML = msgText;
}

function removeSpaces(str) {
  return str.replace(/\s+/g, '');
}

function reloadSelectors() {
  //load start room
  //load end room
  //load grouping

  //Save the current state of the group selectors
  let curStartGroup = document.getElementById(START_GROUP_SELECT_ID).value;
  let curEndGroup = document.getElementById(END_GROUP_SELECT_ID).value;
  let curGroupingGroup = document.getElementById('groupingGroupSelect').value;

  //reload the group selectors
  let groupListArray = localStorage.getItem(GROUP_LIST).split(',');

  let selectorToLoad = document.getElementById(START_GROUP_SELECT_ID);
  loadSelector(groupListArray, selectorToLoad);

  selectorToLoad = document.getElementById(END_GROUP_SELECT_ID);
  loadSelector(groupListArray, selectorToLoad);

  selectorToLoad = document.getElementsByClassName('groupSelect');
  loadSelector(groupListArray, selectorToLoad);

  //select previously selected group, if it exists
  selectIfExists(curStartGroup, START_GROUP_SELECT_ID);
  selectIfExists(curEndGroup, END_GROUP_SELECT_ID);
  selectIfExists(curGroupingGroup, 'groupingGroupSelect');

  //reload the path selector based on the group
  loadRooms(document.getElementById(START_GROUP_SELECT_ID).value, START_PATH_SELECT_ID, 'start');
  loadRooms(document.getElementById(END_GROUP_SELECT_ID).value, END_PATH_SELECT_ID, 'end');

  //reload the group path selector based on the selected group
  curGroupingGroup = document.getElementById('groupingGroupSelect').value;
  let pathArray = localStorage.getItem(curGroupingGroup).split(',');

  selectorToLoad = document.getElementById('groupingCurPathSelect');
  loadSelector(pathArray, selectorToLoad);

  //reload the all_paths selector
  pathArray = localStorage.getItem(PATH_LIST).split(',');
  selectorToLoad = document.getElementsByClassName('pathSelect');
  loadSelector(pathArray, selectorToLoad);

}

function loadRooms(pathList, selectorId, type) {
  let pathArray = localStorage.getItem(pathList).split(',');
  let startRoomArray = new Array();
  let endRoomArray = new Array();
  let selectorToLoad = document.getElementById(selectorId);

  pathArray.forEach(function(path) {
    let rooms = path.split('__2__');
    if (rooms[0]) {
      startRoomArray.push(rooms[0]);
    }
    if (rooms[1]) {
      endRoomArray.push(rooms[1]);
    }
  });

  if (type === 'start') {
    let uniqRooms = [...new Set(startRoomArray)];
    loadSelector(uniqRooms, selectorToLoad);
  } else {
    let uniqRooms = [...new Set(endRoomArray)];
    loadSelector(uniqRooms, selectorToLoad);
  }
}

function loadSelector(optionArray, selectorToLoad) {
  //Sort the array before populating the list
  optionArray.sort();

  let selectors = selectorToLoad.length;

  if (!(selectorToLoad instanceof HTMLCollection)) {
    //false: only one selector given, process as single

    //Clear the current options
    selectorToLoad.options.length = 0;

    //Populate the list from the array
    optionArray.forEach(function(item) {
      if (item) {
        let opt = document.createElement('option');
        opt.textContent = item;
        opt.value = item;
        selectorToLoad.add(opt);
      }
    });

  } else {
    //true: collection given, process as multiple
    for (let i = 0; i < selectors; i++) {
      //Clear the current options
      selectorToLoad[i].options.length = 0;

      //Populate the list from the array
      optionArray.forEach(function(item) {
        if (item) {
          let opt = document.createElement('option');
          opt.textContent = item;
          opt.value = item;
          selectorToLoad[i].add(opt);
        }
      });
    };
  }
}

/*
  This function is used by the selectors for the onchange event
*/
function groupSelected(groupSelectId, pathSelectId) {
  //save currently selected paths
  let curStartRoom = document.getElementById(START_PATH_SELECT_ID).value;
  let curEndRoom = document.getElementById(END_PATH_SELECT_ID).value;
  let curGroupingRoom = document.getElementById('groupingCurPathSelect').value;

  //reload all of the selectors
  reloadSelectors();

  //reselect previously selected paths for all path selectors if it still exists
  selectIfExists(curStartRoom, START_PATH_SELECT_ID);
  selectIfExists(curEndRoom, END_PATH_SELECT_ID);
  selectIfExists(curGroupingRoom, 'groupingCurPathSelect');
}

function selectIfExists(valToSel, selectorId) {
  let exists = document.querySelector('#' + selectorId + ' [value="' + valToSel + '"]');
  if (valToSel && exists) {
    document.querySelector('#' + selectorId + ' [value="' + valToSel + '"]').selected = true;
  }
}

function combatEnd() {
  inCombat = false;
  combatEndTime = Date.now();
}

function combatStart() {
  lastSwingTime = Date.now();
  inCombat = true;
}

function toggleMoveButtons(turnOn) {
  let walk = document.getElementById('pathWalk');
  let run = document.getElementById('pathRun');
  let loop = document.getElementById('pathLoop');
  if (turnOn) {
    //enable the buttons
    walk.disabled = false;
    run.disabled = false;
    loop.disabled = false;
  } else {
    //disable the buttons
    walk.disabled = true;
    run.disabled = true;
    loop.disabled = true;
  }
}

/*****************************************************************************\
| Event handling code                                                         |
\*****************************************************************************/

//Deal with events from the WebMud hub
/*
  Start combat    .attack
  End combat      .breakCombat or .death
  Start move      .playerMove
  End move        .showRoom
  AI Command      .aiCommand
  Party messages  .partyMessage

  Note: setting the variables then passing them actionData is necessary
  otherwise the main webmud window won't show the message normally
*/

//Physical combat started, set combat flag to true
let wm_moveToAttack = window.attack;
window.attack = function(actionData) {
  wm_moveToAttack(actionData);
  combatStart();
}

//Spell combat started, set combat flag to true
let wm_castSpell = window.castSpell;
window.castSpell = function(actionData) {
  wm_castSpell(actionData);
  switch (actionData.Result) {
    case -11:
      //attempt to cast but fail
      if (actionData.CasterID === playerID) {
        lastSwingTime = Date.now();
      }
      return;
    case 4:
      //Player cast (good and bad)
      if (actionData.CasterID === playerID && actionData.EvilInCombat) {
        lastSwingTime = Date.now();
      }
      return;
    case 7:
      //single target move to cast
      if (actionData.CasterID === playerID) {
        combatStart();
      }
      return;
    case 8:
      //room move to cast
      if (actionData.CasterID === playerID) {
        combatStart();
      }
      return;
  }
}

//Exp earned, set combat flag to false
let wm_gainExperience = window.gainExperience;
window.gainExperience = function(actionData) {
  wm_gainExperience(actionData);
  combatEnd();
}

//Move started, set move flag to true
let wm_playerMove = window.playerMove;
window.playerMove = function(actionData) {
  wm_playerMove(actionData);
  playerMoving = true;
  inCombat = false;
}

//Move ended, set move flag to false
let wm_showRoom = window.showRoom;
window.showRoom = function(actionData) {
  wm_showRoom(actionData);
  playerMoving = false;
}

//Note time of last combat swing to fix movement combat bug
let wm_combatSwing = window.combatSwing;
window.combatSwing = function(actionData) {
  wm_combatSwing(actionData);
  if (actionData.AttackerID === playerID) {
    lastSwingTime = Date.now();
  }
}

//Deal with AI commands
let wm_aiCommand = window.aiCommand;
window.aiCommand = function(actionData) {
  wm_aiCommand(actionData);
  if (actionData.Hint === 'Running - Low HP') {
    aiRunning = true;
  } else if (actionData.Hint === 'Moving back - Health/Mana OK') {
    aiRunning = false;
    playerResting = false;
  }

  if (actionData.TypedCommand === 'rest') {
    playerResting = true;
  }
}

//Deal with party messages
let wm_partyMessage = window.partyMessage;
window.partyMessage = function(actionData) {
  wm_partyMessage(actionData);
  let slicedMessage = actionData.MessageText.slice(0,8);
  if (slicedMessage === 'Running!') {
    aiRunning = true;
  }
}

//Remove resting flag when player is a full HP/MA
let wm_updateHPMA = window.updateHPMA;
window.updateHPMA = function(actionData) {
  wm_updateHPMA(actionData);
  if (actionData.HP === actionData.MaxHP && actionData.MA === actionData.MaxMA) {
    playerResting = false;
  }
}

//event listener for the dialog modal
document.getElementById('importExportDialog').addEventListener("click", function(e) {
  switch (e.target.id) {
    case 'importPath':
      getPathsToImport('CustomPaths_', 'pathGroups_');
      break;

    case 'exportSingle':
      exportPaths('CustomPaths_', 'pathGroups_', 'single');
      break;

    case 'exportGroup':
      exportPaths('CustomPaths_', 'pathGroups_', 'group');
      break;

    case 'exportAll':
      exportPaths('CustomPaths_', 'pathGroups_', 'all');
      break;

    case 'clearAllPaths':
      clearAllPaths('CustomPaths_','pathGroups_')
      break;

    default:

  }
},false);

//keypress events for numpad walking
$(document).keyup(function(e) {
  switch (e.which) {
    case 96:  //numpad 0
      sendMessageDirect('rest');
      $('#message').val('');
      break;

    case 97:  //numpad 1
      sendMessageDirect('sw');
      $('#message').val('');
      break;

    case 98:  //numpad 2
      sendMessageDirect('s');
      $('#message').val('');
      break;

    case 99:  //numpad 3
      sendMessageDirect('se');
      $('#message').val('');
      break;

    case 100:  //numpad 4
      sendMessageDirect('w');
      $('#message').val('');
      break;

    case 101:  //numpad 5
    sendMessageDirect('sn');
    $('#message').val('');
      break;

    case 102:  //numpad 6
      sendMessageDirect('e');
      $('#message').val('');
      break;

    case 103:  //numpad 7
      sendMessageDirect('nw');
      $('#message').val('');
      break;

    case 104:  //numpad 8
      sendMessageDirect('n');
      $('#message').val('');
      break;

    case 105:  //numpad 9
      sendMessageDirect('ne');
      $('#message').val('');
      break;

    case 107:  //numpad +
      sendMessageDirect('u');
      $('#message').val('');
      break;

    case 109:  //numpad -
      sendMessageDirect('d');
      $('#message').val('');
      break;

    case 110:  //numpad .
      sendMessageDirect('med');
      $('#message').val('');
      break;

    default:

  }

});




//The following MIT license and credits apply to the Graph class, which is an
//implementation of the Dijkstra algorithm.  Code was obtained from github on
//2016-03-21 at https://github.com/andrewhayward/dijkstra
/*
The MIT License (MIT)

Copyright (c) 2014 Andrew Hayward

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var Graph = (function (undefined) {

	var extractKeys = function (obj) {
		var keys = [], key;
		for (key in obj) {
		    Object.prototype.hasOwnProperty.call(obj,key) && keys.push(key);
		}
		return keys;
	}

	var sorter = function (a, b) {
		return parseFloat (a) - parseFloat (b);
	}

	var findPaths = function (map, start, end, infinity) {
		infinity = infinity || Infinity;

		var costs = {},
		    open = {'0': [start]},
		    predecessors = {},
		    keys;

		var addToOpen = function (cost, vertex) {
			var key = "" + cost;
			if (!open[key]) open[key] = [];
			open[key].push(vertex);
		}

		costs[start] = 0;

		while (open) {
			if(!(keys = extractKeys(open)).length) break;

			keys.sort(sorter);

			var key = keys[0],
			    bucket = open[key],
			    node = bucket.shift(),
			    currentCost = parseFloat(key),
			    adjacentNodes = map[node] || {};

			if (!bucket.length) delete open[key];

			for (var vertex in adjacentNodes) {
			    if (Object.prototype.hasOwnProperty.call(adjacentNodes, vertex)) {
					var cost = adjacentNodes[vertex],
					    totalCost = cost + currentCost,
					    vertexCost = costs[vertex];

					if ((vertexCost === undefined) || (vertexCost > totalCost)) {
						costs[vertex] = totalCost;
						addToOpen(totalCost, vertex);
						predecessors[vertex] = node;
					}
				}
			}
		}

		if (costs[end] === undefined) {
			return null;
		} else {
			return predecessors;
		}

	}

	var extractShortest = function (predecessors, end) {
		var nodes = [],
		    u = end;

		while (u) {
			nodes.push(u);
			u = predecessors[u];
		}

		nodes.reverse();
		return nodes;
	}

	var findShortestPath = function (map, nodes) {
		var start = nodes.shift(),
		    end,
		    predecessors,
		    path = [],
		    shortest;

		while (nodes.length) {
			end = nodes.shift();
			predecessors = findPaths(map, start, end);

			if (predecessors) {
				shortest = extractShortest(predecessors, end);
				if (nodes.length) {
					path.push.apply(path, shortest.slice(0, -1));
				} else {
					return path.concat(shortest);
				}
			} else {
				return null;
			}

			start = end;
		}
	}

	var toArray = function (list, offset) {
		try {
			return Array.prototype.slice.call(list, offset);
		} catch (e) {
			var a = [];
			for (var i = offset || 0, l = list.length; i < l; ++i) {
				a.push(list[i]);
			}
			return a;
		}
	}

	var Graph = function (map) {
		this.map = map;
	}

	Graph.prototype.findShortestPath = function (start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(this.map, start);
		} else if (arguments.length === 2) {
			return findShortestPath(this.map, [start, end]);
		} else {
			return findShortestPath(this.map, toArray(arguments));
		}
	}

	Graph.findShortestPath = function (map, start, end) {
		if (Object.prototype.toString.call(start) === '[object Array]') {
			return findShortestPath(map, start);
		} else if (arguments.length === 3) {
			return findShortestPath(map, [start, end]);
		} else {
			return findShortestPath(map, toArray(arguments, 1));
		}
	}

	return Graph;

})();


/*****************************************************************************\
| Jaeger's Combat Stats Watcher                                               |
\*****************************************************************************/
var JaegerWM;
(function (JaegerWM) {
    var CombatStatsWatcher = (function () {
        function CombatStatsWatcher() {
            var _this = this;
            this.swingCount = 0;
            this.hitCount = 0;
            this.hitDamage = 0;
            this.bsCount = 0;
            this.bsDamage = 0;
            this.bsAttempt = 0;
            this.critCount = 0;
            this.critDamage = 0;
            this.missCount = 0;
            this.swingsAtYouCount = 0;
            this.dodgeCount = 0;
            this.glanceCount = 0;
            this.roundCount = 0;
            this.roundStart = Date.now();
            this.inRound = false;
            this.wmCombatSwing = combatSwing;
            combatSwing = function (actionData) { _this.combatSwingOverride(actionData); };
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Round Damage (SPR):</td>' +
                '<td><span id="roundStats">0 (0)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Hit Damage (%):</td>' +
                '<td><span id="hitStats">0 (0.00 %)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>BS Damage (%):</td>' +
                '<td><span id="bsStats">0 (0.00 %)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Crit Damage (%):</td>' +
                '<td><span id="critStats">0 (0.00 %)</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Miss Percentage:</td>' +
                '<td><span id="missStats">0.00 %</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Dodge Percentage:</td>' +
                '<td><span id="dodgeStats">0.00 %</span></td>' +
                '</tr>');
            $('#divExpTimer table tr:last').before('<tr>' +
                '<td>Glance Percentage:</td>' +
                '<td><span id="glanceStats">0.00 %</span></td>' +
                '</tr>');
            $('#btnResetExpTimer').click(function () {
                _this.resetCombatStats();
            });
            setInterval(function () {
                _this.setStatsUI();
            }, 2000);
        }
        Object.defineProperty(CombatStatsWatcher.prototype, "roundDamageAvg", {
            get: function () {
                if (this.roundCount === 0)
                    return "0";
                return Math.round((this.hitDamage + this.critDamage) / this.roundCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "swingsPerRound", {
            get: function () {
                if (this.roundCount === 0)
                    return "0";
                return Math.round(this.swingCount / this.roundCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "hitPercent", {
            get: function () {
                return this.getPercent(this.hitCount, this.swingCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "hitDamageAvg", {
            get: function () {
                if (this.hitCount === 0)
                    return "0";
                return Math.round(this.hitDamage / this.hitCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "bsPercent", {
            get: function () {
                return this.getPercent(this.bsCount, this.bsAttempt);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "bsDamageAvg", {
            get: function () {
                if (this.bsCount === 0)
                    return "0";
                return Math.round(this.bsDamage / this.bsCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "critPercent", {
            get: function () {
                return this.getPercent(this.critCount, this.swingCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "critDamageAvg", {
            get: function () {
                if (this.critCount === 0)
                    return "0";
                return Math.round(this.critDamage / this.critCount).toString();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "missPercent", {
            get: function () {
                return this.getPercent(this.missCount, this.swingCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "dodgePercent", {
            get: function () {
                return this.getPercent(this.dodgeCount, this.swingsAtYouCount);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CombatStatsWatcher.prototype, "glancePercent", {
            get: function () {
                return this.getPercent(this.glanceCount, this.swingsAtYouCount);
            },
            enumerable: true,
            configurable: true
        });
        CombatStatsWatcher.prototype.setStatsUI = function () {
            $('#roundStats').text(this.roundDamageAvg + " (" + this.swingsPerRound + " SPR)");
            $('#hitStats').text(this.hitDamageAvg + " (" + this.hitPercent + " %)");
            $('#bsStats').text(this.bsDamageAvg + " (" + this.bsPercent + " %)");
            $('#critStats').text(this.critDamageAvg + " (" + this.critPercent + " %)");
            $('#missStats').text(this.missPercent + " %");
            $('#dodgeStats').text(this.dodgePercent + " %");
            $('#glanceStats').text(this.glancePercent + " %");
        };
        CombatStatsWatcher.prototype.resetCombatStats = function () {
            this.swingCount = 0;
            this.hitCount = 0;
            this.hitDamage = 0;
            this.bsCount = 0;
            this.bsDamage = 0;
            this.bsAttempt = 0;
            this.critCount = 0;
            this.critDamage = 0;
            this.missCount = 0;
            this.swingsAtYouCount = 0;
            this.dodgeCount = 0;
            this.glanceCount = 0;
            this.roundCount = 0;
        };
        CombatStatsWatcher.prototype.combatSwingOverride = function (actionData) {
            this.wmCombatSwing(actionData);
            if (actionData.AttackerID === playerID) {
                var now = Date.now();
                if (!this.inRound || (now - this.roundStart) > 1500) {
                    this.roundStart = now;
                    this.inRound = true;
                    this.roundCount++;
                }
                if (actionData.Surprise) {
                    this.bsAttempt++;
                }
                else {
                    this.swingCount++;
                }
                switch (actionData.SwingResult) {
                    case 1:
                        if (actionData.Surprise) {
                            this.bsCount++;
                            this.bsDamage += actionData.Damage;
                        }
                        else {
                            this.hitCount++;
                            this.hitDamage += actionData.Damage;
                        }
                        break;
                    case 2:
                        this.critCount++;
                        this.critDamage += actionData.Damage;
                        break;
                    case 0:
                        this.missCount++;
                        break;
                }
            }
            else if (actionData.TargetID === playerID) {
                this.inRound = false;
                this.swingsAtYouCount++;
                switch (actionData.SwingResult) {
                    case 3:
                        this.dodgeCount++;
                        break;
                    case 4:
                        this.glanceCount++;
                        break;
                }
            }
            else {
                this.inRound = false;
            }
        };
        CombatStatsWatcher.prototype.getPercent = function (count, total) {
            return total === 0 ? "0.00" : ((count / total) * 100).toFixed(2);
        };
        return CombatStatsWatcher;
    }());
    JaegerWM.CombatStatsWatcher = CombatStatsWatcher;
})(JaegerWM || (JaegerWM = {}));

let statsWatcher;
setTimeout(function(){
    statsWatcher = new JaegerWM.CombatStatsWatcher();
}, 2000);
