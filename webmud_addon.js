/*****************************************************************************\
| Form injection code, uses jquery                                            |
\*****************************************************************************/
'use strict';

//Add some elements so the user can select paths and options
$("<div id='pathUse' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
<p>Pathing and Looping</p>\
<p>Select a path and choose Walk, Run, or Loop<br/>\
Group:&nbsp<select id='groupSelect' onchange=\"groupSelected('groupSelect','custPathSelect')\" style='width:225px;'></select>\
<br />Path:&nbsp&nbsp&nbsp<select id='custPathSelect' style='width:225px;'></select>\
</p>\
<p><button class='btn btn-default' onclick=\"lookupPathAndMove('custPathSelect','stepDelay',false,false)\">Walk</button>\
<button class='btn btn-default' onclick=\"lookupPathAndMove('custPathSelect','stepDelay',true,false)\">Run</button>\
<button class='btn btn-default' onclick=\"lookupPathAndMove('custPathSelect','stepDelay',false,true)\">Loop</button>\
</p>\
<p>Stop path/loop: \
<button class='btn btn-default' onclick=\"stopWalking('now')\">Now!</button>\
<button class='btn btn-default' onclick=\"stopWalking('end of loop')\">End Of Loop</button>\
</p>\
<p>Fine tune step delay (ms): <input type='number' id='stepDelay' name = 'stepDelay' min='1' value='2500' style='width:60px;'/>\
</p>\
</div>\
<div id='autoCommands' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
<p>Auto Commands</p>\
<p>Enter a command and frequency below. Whatever you put in the box will be sent. \
If you want to do multiple commands, seperate them with a comma. Sending \
commands is toggled with the checkbox (on/off).\
</p>\
<p>Send auto commands: \
<input type='checkbox' id='sendAutoCmds' onchange=\"autoCmdCheck('autoCmd','autoCmdDelay','sendAutoCmds')\")/>\
</p>\
<p>Command(s):  \
<input type='text' id='autoCmd' style='width:150px' value='' />\
</p>\
<p>Delay (seconds): \
<input type='number' id='autoCmdDelay' name = 'autoCmdDelay' min='1' value='6' style='width:50px;'/>\
</p>\
</div>\
<div id='pathCreate' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
<p>Path and Loop Creation</p>\
<p>Create a new path/loop by filling in the boxes below.\
An example is provided in the boxes. Spaces will be removed.\
</p>\
<p>Starting room / Loop name: \
<input type='text' id='startingRoom' style='width:150px;' value='WF_Center' />\
</p>\
<p>Ending room (n/a for loops): \
<input type='text' id='endingRoom' style='width:150px;' value='PF_Gatehouse' />\
</p>\
<p>Enter the steps for the path below, seperated by commas (n,s,e,w,ne,se,sw,nw,u,d):\
<br /><input type='text' id='newPath' style='width:400px;' value='n,s,e,w,ne,se,sw,nw,u,d' />\
</p>\
<p><button class='btn btn-default' onclick=\"newPath('CustomPaths_','path')\">Save Path</button>\
<button class='btn btn-default' onclick=\"newPath('CustomPaths_','loop')\">Save Loop</button>\
</p>\
</div>\
<div id='pathTools' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
<p>Path Utilities</p>\
<p>Delete the currently selected path (at the top):\
<br /><button class='btn btn-default' onclick=\"deleteSelectedPath('CustomPaths_','custPathSelect','pathGroups_')\">Delete Path</button>\
</p>\
<br /><br />\
<p>Path, loop, and group import/export:</p>\
<p>The following buttons and box will let you do a mass path/group import and export. \
Special formatting is required for import so be careful when using \
this ability and only paste paths from a known good source.  Once the paths \
are pasted into the box, click Import.\
</p>\
<br />\
<button class='btn btn-default' onclick=\"getPathsToImport('CustomPaths_', 'pathGroups_')\">Import</button>\
<button class='btn btn-default' onclick=\"exportPaths('CustomPaths_', 'pathGroups_')\">Export</button>\
&nbsp&nbsp&nbsp&nbsp&nbsp\
<button class='btn btn-default' onclick=\"clearAllPaths('CustomPaths_','pathGroups_')\">Clear All Paths</button>\
</p>\
<p><textarea id='pathImportExport' rows='4' cols='50'></textarea>\
</p>\
</div>\
<div id='pathTools' class='panel col-xs-12 col-lg-4' style='padding:10px;float:left;margin-bottom:10px'>\
<p>Path grouping</p>\
<p>Select a group from the dropdown box and add/remove paths.\
</p>\
<p>Select Group:&nbsp&nbsp\
<select id='groupingGroupSelect' onchange=\"groupSelected('groupingGroupSelect','groupingCurPathSelect')\" style='width:225px;'></select>\
</p>\
<p>Current paths:&nbsp\
<select id='groupingCurPathSelect' style='width:225px;'></select>\
</p>\
<p>All Paths:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp\
<select id='groupingAllPathSelect' style='width:225px;'></select>\
</p>\
<p>\
<button class='btn btn-default' onclick=\"editGroup('add')\">Add Path</button>\
<button class='btn btn-default' onclick=\"editGroup('remove')\">Remove Path</button>\
</p>\
<p><button class='btn btn-default' onclick=\"editGroup('new')\">New Group</button>\
<button class='btn btn-default' onclick=\"editGroup('delete')\">Delete Group</button>\
</p>\
</div>\
").insertAfter("#divExpTimer");

$("<div id='addonStatus'>\
<p>Addon Status: <label id=\"addonStatusText\"></label></p>\
</div>").insertAfter("#mainScreen");

//Constants used across many functions
const PATH_SELECT_ID = 'custPathSelect';
const GROUP_SELECT_ID = 'groupSelect';
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

//Call loading script
loadPlayer();

/*****************************************************************************\
| Path walking / looping code                                                 |
\*****************************************************************************/

function loadPaths(pathList, pathSelectId) {
  let custPaths = localStorage.getItem(pathList);
  let custPathsArray = custPaths.split(',');
  let custPathSelector = document.getElementById(pathSelectId);

  //Sort the array before populating the list
  custPathsArray.sort();

  //Clear the box
  custPathSelector.options.length = 0;

  //Populate the list from the array
  custPathsArray.forEach(function(path) {
    if (path !== '') {
      let opt = document.createElement('option');
      opt.textContent = path;
      opt.value = path;
      custPathSelector.add(opt);
    }
  });
}

function groupSelected(groupSelectId, pathSelectId) {
  let group = document.getElementById(groupSelectId).value;
  loadPaths(group, pathSelectId);
}

function lookupPathAndMove(pathSelectId, delaySelectId, runPath, loopPath) {
  let selectedPath = document.getElementById(pathSelectId).value;
  let path = localStorage.getItem(selectedPath);
  let stepDelay = document.getElementById(delaySelectId).value;

  //If the user wants to loop, set the loop value to true
  stopWalkingFlag = '';

  //if the player want to run (no combat), disable AI combat
  if (runPath) {
    sendMessageDirect('DisableAI Combat');
    document.getElementById('chkAICombat').checked = false;
  }

  //start the path
  walkPath(path, stepDelay, loopPath, selectedPath);

  //alert the player that the path/loop as started
  if (loopPath) {
    notifyPlayer('greenyellow', 'Looping ' + selectedPath);
  } else {
    notifyPlayer('greenyellow', 'Walking path: ' + selectedPath);
  }
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

function exportPaths(pathList, groupList) {
  let currentPaths = localStorage.getItem(pathList);
  let currentPathsArray = currentPaths.split(',');
  let currentGroups = localStorage.getItem(groupList);
  let currentGroupsArray = currentGroups.split(',');
  let pathsToExport = new Array();
  let exportString = '';

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
  if (document.getElementById(cmdCheckBox).checked) {
    let cmdDelay = document.getElementById(delayId).value;
    cmdDelay = cmdDelay * 1000;
    sendAutoCmds = true;
    startAutoCmds(cmdBox, cmdDelay);
  } else {
    sendAutoCmds = false;
  }
}

function startAutoCmds(cmdBox, cmdDelay) {
  notifyPlayer('yellow','Auto Commands Started');
  let interval = setInterval(() => {
    if (sendAutoCmds) {
      let commands = document.getElementById(cmdBox).value;
      let commandArray = commands.split(',');

      commandArray.forEach(function(cmd) {
        sendMessageDirect(cmd);
      });
    } else {
      //stop auto commands once the checkbox is unchecked
      clearInterval(interval);
      notifyPlayer('yellow','Auto Commands Stopped');
    }
  }, cmdDelay);
}


/*****************************************************************************\
| Path grouping and chaining code                                             |
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
    loadPaths(PATH_LIST, GROUP_SELECT_ID);

    //clear the boxes for the next path
    document.getElementById('pathTextArea').value = '';
    document.getElementById('pathGroupName').value = '';

    //tell the player the new group/chain has been added
    notifyPlayer('green','New path group/chain added');
  }
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

function loadPlayer() {
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

  //alert the player that the addon loaded successfully
  notifyPlayer('yellow','WebMUD addon successfully loaded');

}

function reloadSelectors() {
  //Load paths into the main path/looping selectors
  let curGroup = document.getElementById(GROUP_SELECT_ID).value;

  //reload the group list
  loadPaths(GROUP_LIST, GROUP_SELECT_ID);
  //select previously selected group, if it exists
  let groupExists = document.querySelector('#' + GROUP_SELECT_ID + ' [value="' + curGroup + '"]');
  if (curGroup && groupExists) {
    document.querySelector('#' + GROUP_SELECT_ID + ' [value="' + curGroup + '"]').selected = true;
  }
  //reload the path selector based on the group
  loadPaths(document.getElementById(GROUP_SELECT_ID).value, PATH_SELECT_ID);


  //Load paths into the grouping selectors
  curGroup = document.getElementById('groupingGroupSelect').value;
  //reload the group list
  loadPaths(GROUP_LIST, 'groupingGroupSelect');
  //select previously selected group, if it exists
  groupExists = document.querySelector('#groupingGroupSelect [value="' + curGroup + '"]');
  if (curGroup && groupExists) {
    document.querySelector('#groupingGroupSelect [value="' + curGroup + '"]').selected = true;
  }
  //reload the group path selector based on the selected group
  loadPaths(document.getElementById('groupingGroupSelect').value, 'groupingCurPathSelect');
  //reload the all_paths selector
  loadPaths(PATH_LIST, 'groupingAllPathSelect');

}

function combatEnd() {
  inCombat = false;
  combatEndTime = Date.now();
}

function combatStart() {
  lastSwingTime = Date.now();
  inCombat = true;
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

//Combat started, set combat flag to true
let wm_moveToAttack = window.attack;
window.attack = function(actionData) {
  wm_moveToAttack(actionData);
  combatStart();
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
