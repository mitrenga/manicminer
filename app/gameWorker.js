/**/

/*/

/**/
// begin code

var counter = 0;
var counter2 = 0;
var counter4 = 0;
var counter6 = 0;
var gameData = null;
var controls = {left: false, right: false, jump: false};
var jumpCounter = 0;
var jumpDirection = 0;
var jumpMap = [-4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var fallingCounter = 0;
var fallingDirection = 0;
var mustMovingDirection = 0;
var canMovingDirection = 0;
var previousDirection = 0;
var completed = 0;
var bonus = 0;


function gameLoop() {
  setTimeout(gameLoop, 80);
  
  if (gameData != null) {
    counter++;
    gameData.info[0] = counter;
    if (!(counter%2)) {
      counter2++;
    }
    gameData.info[1] = counter2;
    if (!(counter%4)) {
      counter4++;
    }
    gameData.info[2] = counter4;
    if (!(counter%6)) {
      counter6++;
    }
    gameData.info[3] = counter6;

    conveyors();
    items();
    if (!gameData.info[4]) { // if not demo
      willy();
    }
    guardians();
    lightBeam();
    barriers();
    if (!gameData.info[4]) { // if not demo
      checkTouchItems();
      checkCrash();
      checkTouchPortal();
      checkTouchLightBeam();
      checkTouchSwitches();
    }

    if (bonus) {
      if (bonus < 100) {
        gameData.info[6] += bonus;
        bonus = 0;
      } else {
        gameData.info[6] += 100;
        bonus -= 100;
      }
    }
  
    postMessage({id: 'update', gameData: gameData});
  }
} // gameLoop

function conveyors() {
  gameData.conveyors.forEach((conveyor) => {
    if (conveyor.frame == 3) {
      conveyor.frame = 0;
    } else {
      conveyor.frame++;
    }  
  });
} // conveyors

function items() {
  gameData.items.forEach((item) => {
    if (item.frame == 3) {
      item.frame = 0;
    } else {
      item.frame++;
    }  
  });
} // items

function willy() {
  var willy = gameData.willy[0];

  if (jumpCounter == jumpMap.length) {
    jumpCounter = 0;
    fallingDirection = jumpDirection;
    jumpDirection = 0;
    fallingCounter = 5;
  }      

  canMovingDirection = 0;

  var standingOn = checkStandingWithObjectsArray(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.crumblingFloors, gameData.conveyors]);

  standingOn.forEach((object) => {
    if ('crumbling' in object) {
      if (object.frame < 7) {
        object.frame++;
      } else {
        object.hide = true;
      }
    }
    if ('moving' in object) {
      switch (object.moving) {
        case 'right':
          canMovingDirection = 1;
          break;
        case 'left':
          canMovingDirection = -1;
          break;
      }
    }
  });
  
  if (!canMovingDirection) {
    mustMovingDirection = 0;
  }

  if (fallingCounter) {
    if (standingOn.length) {
      if (fallingCounter > 9) {
        gameData.info[5] = true;
      }
      fallingCounter = 0;
      if (canMovingDirection == fallingDirection) {
        mustMovingDirection = canMovingDirection;
      }
      fallingDirection = 0;
      postMessage({id: 'stopAudioChannel', channel: 'sounds'});
    } else {
      willy.y += 4;
      fallingCounter++;
    }
  } else {
    if (!jumpCounter && !standingOn.length) {
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({id: 'playSound', channel: 'sounds', sound: 'fallingSound'});
    }
  }

  if (jumpCounter && jumpMap[jumpCounter] >= 0) {
    if (standingOn.length) {
      jumpCounter = 0;
      if (canMovingDirection == jumpDirection) {
        mustMovingDirection = canMovingDirection;
      }
      jumpDirection = 0;
      postMessage({id: 'stopAudioChannel', channel: 'sounds'});
    }
  }

  if (jumpCounter > 0) {
    if (canMove(0, jumpMap[jumpCounter])) {
      jumpCounter++;
      willy.y += jumpMap[jumpCounter-1]; 
    } else {
      jumpCounter = 0;
      jumpDirection = 0;
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({id: 'playSound', channel: 'sounds', sound: 'fallingSound'});
    }
  }

  if (canMovingDirection == 1 && !controls.left) {
    mustMovingDirection = 1;
  }
  if (canMovingDirection == -1 && !controls.right) {
    mustMovingDirection = -1;
  }

  var newDirection = 0;
  if ((controls.right && !controls.left && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == -1 && previousDirection == 1))) ||
      (jumpCounter && jumpDirection == 1) ||
      (mustMovingDirection == 1)) {

    newDirection = 1;
    if (willy.direction == 1) {
      willy.direction = 0;
    } else {
      jumpDirection = 1;
      if (canMove(2, 0)) {
        willy.x += 2;
        if (willy.frame == 3) {
          willy.frame = 0;
        } else {
          willy.frame++;
        }
      }
    }
  }

  if ((controls.left && !controls.right && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == 1 && previousDirection == -1))) ||
      (jumpCounter && jumpDirection == -1) ||
      (mustMovingDirection == -1)) {

    newDirection = -1;
    if (willy.direction == 0) {
      willy.direction = 1;
    } else {
      jumpDirection = -1;
      if (canMove(-2, 0)) {
        willy.x -= 2;
        if (willy.frame == 0) {
          willy.frame = 3;
        } else {
          willy.frame--;
        }
      }
    }
  }

  previousDirection = newDirection;

  if (!jumpCounter && !fallingCounter && controls.jump) {
    if (canMove(0, jumpMap[jumpCounter])) {
      jumpCounter = 1;
      willy.y += jumpMap[jumpCounter-1]; 
      postMessage({id: 'playSound', channel: 'sounds', sound: 'jumpSound'});
    }
  }

  if (!jumpCounter) {
    jumpDirection = 0;
  }
} // willy

function guardians() {
  gameData.guardians.forEach((guardian) => {
    if ('action' in guardian) {
      delete guardian.action;
    }

    switch (guardian.type) {
      case 'horizontal':
        var toMove = false;
        switch (guardian.speed) {
          case 0:
            toMove = true;
            break;
          case 1:
            if (!(this.counter%2)) {
              toMove = true;
            }
            break;
        }
        if (toMove) {
          switch (guardian.direction) {
            case 0:
              if (guardian.x == guardian.limitRight)
              {
                guardian.direction = 1;
              } else {
                guardian.x += 2;
                if (guardian.frame == 3) {
                  guardian.frame = 0;
                } else {
                  guardian.frame++;
                }
              }
              break;
            case 1:
              if (guardian.x == guardian.limitLeft)
              {
                guardian.direction = 0;
              } else {
                guardian.x -= 2;
                if (guardian.frame == 0) {
                  guardian.frame = 3;
                } else {
                  guardian.frame--;
                }
              }
              break;
          }
        }
        break;

      case 'vertical':
        if ('forceDirection' in guardian && guardian.forceDirection !== false) {
          switch (guardian.forceDirection) {
            case 0:
              if (guardian.y+guardian.speed < guardian.limitDown) {
                guardian.y += guardian.speed;
              }
              if (guardian.frame == guardian.frames-1) {
                guardian.frame = 0;
              } else {
                guardian.frame++;
              }
              break;
            case 1:
              if (guardian.y-guardian.speed > guardian.limitUp) {
                guardian.y -= guardian.speed;
              }
              if (guardian.frame == 0) {
                guardian.frame = guardian.frames-1;
              } else {
                guardian.frame--;
              }
              break;
          }
        } else {
          switch (guardian.direction) {
            case 0:
              if (guardian.y+guardian.speed >= guardian.limitDown) {
                guardian.direction = 1;
              }
              break;
            case 1:
              if (guardian.y-guardian.speed <= guardian.limitUp) {
                guardian.direction = 0;
              }
              break;
          }
          switch (guardian.direction) {
            case 0:
              guardian.y += guardian.speed;
              if (guardian.frame == guardian.frames-1) {
                guardian.frame = 0;
              } else {
                guardian.frame++;
              }
              break;
            case 1:
              guardian.y -= guardian.speed;
              if (guardian.frame == 0) {
                guardian.frame = guardian.frames-1;
              } else {
                guardian.frame--;
              }
              break;
          }
        }
        break;        

      case 'forDropping':
        if (!(counter%8)) {
          switch (guardian.direction) {
            case 0:
              if (guardian.frame == 1) {
                guardian.frame = 0;
              } else {
                guardian.frame++;
              }
              break;
            case 1:
              if (guardian.frame == 1) {
                guardian.frame = 0;
              } else {
                guardian.frame++;
              }
              break;
          }
        }
        if (guardian.hide == false && guardian.direction == 1) {
          guardian.y += 4;
          if (guardian.y == guardian.limitDown) {
            guardian.hide = true;
          }
        }
        break;        
        
      case 'falling':
        switch (guardian.direction) {
          case 0:
            if (guardian.y >= guardian.limitDown) {
              guardian.direction = 1;
            }
            break;
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
            guardian.direction++;
            break;
          case 7:
            guardian.direction = 0;
            if (guardian.frame == guardian.frames-1) {
              guardian.frame = 0;
            } else {
              guardian.frame++;
            }
            guardian.y = guardian.next[guardian.x].y;
            guardian.x = guardian.next[guardian.x].x;
            break;
        }
        switch (guardian.direction) {
          case 0:
            guardian.y += guardian.speed;
            if (guardian.frame == guardian.frames-1) {
              guardian.frame = 0;
            } else {
              guardian.frame++;
            }
            break;
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
            if (guardian.frame == guardian.frames-1) {
              guardian.frame = 0;
            } else {
              guardian.frame++;
            }
            break;
        }
        break;        
    }
  });
} // guardians

function lightBeam() {
  if ('lightBeam' in gameData) {
    var lbData = {x: 0, y: 0, cancel: false, touch: false};
    var part = -1;
    lbData.cancelLight = false;
    while (!lbData.cancelLight) {
      lbData.touchLight = false;
      part++;
      if (!(part%2)) { // to down
        lbData.x = gameData.lightBeam[0].x;
        lbData.y = gameData.lightBeam[0].y;
        if (part > 0) {
          lbData.x = gameData.lightBeam[part-1].x;
          lbData.y = gameData.lightBeam[part-1].y+gameData.lightBeam[part-1].height;
        }
        gameData.lightBeam[part].x = lbData.x;
        gameData.lightBeam[part].y = lbData.y;
        gameData.lightBeam[part].width = 8;
        gameData.lightBeam[part].height = 8;
        gameData.lightBeam[part].hide = false;
        checkTurnLightBeam(lbData, 0, 8);
        gameData.lightBeam[part].width = 8;
        gameData.lightBeam[part].height = lbData.y-gameData.lightBeam[part].y;
      } else { // to left
        lbData.x = gameData.lightBeam[part-1].x-8;
        lbData.y = gameData.lightBeam[part-1].y+gameData.lightBeam[part-1].height-8;
        gameData.lightBeam[part].x = lbData.x;
        gameData.lightBeam[part].y = lbData.y;
        gameData.lightBeam[part].hide = false;
        checkTurnLightBeam(lbData, -8, 0);
        gameData.lightBeam[part].width = gameData.lightBeam[part].x-lbData.x;
        gameData.lightBeam[part].x = lbData.x+8;
        gameData.lightBeam[part].height = 8;
      }
    }
    // reset & hide unused parts
    for (var p = part+1; p < gameData.lightBeam.length; p++) {
      gameData.lightBeam[p].hide = true;
    }
  }
} // lightBeam

function barriers() {
  if ('barriers' in gameData) {
    gameData.barriers.forEach((barrier) => {
      if (!barrier.hide && barrier.frame) {
        barrier.frame++;
        if (barrier.frame == barrier.frames-1) {
          barrier.hide = true;
          if ('actions' in barrier) {
            var actions = barrier.actions;
            actions.forEach((action) => {
              switch(action.type) {
                case 'setValue':
                  gameData[action.objectsArray][action.index][action.variable] = action.value;
                  break;
              }
            });
          }
        }
      }
    });
  }
} // barriers

function checkTouchWithObjectsArray(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        if (!(x+width <= obj.x || y+height <= obj.y || x >= obj.x+obj.width || y >= obj.y+obj.height)) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // checkTouchWithObjectsArray

/*
function checkInsideWithObjectsArray(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        if (x >= obj.x && y >= obj.y && x+width <= obj.x+obj.width && y+height <= obj.y+obj.height) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // checkInsideWithObjectsArray
*/

function checkStandingWithObjectsArray(x, y, width, height, objectsArray) {
  var result = [];

  if (jumpCounter && jumpMap[jumpCounter] < 0) {
    return result;
  }

  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        if (!(x+width <= obj.x || x >= obj.x+obj.width) && y+height == obj.y) {
          result.push(obj);
        }
      }
    }
  }
  return result;
} // checkStandingWithObjectsArray

function checkTurnLightBeam(lbData, moveX, moveY) {
  while (!lbData.touchLight && !lbData.cancelLight) {
    if (!lbData.touchLight && !lbData.cancelLight) {
      lbData.touchLight = checkTouchWithObjectsArray(lbData.x, lbData.y, 8, 8, [gameData.guardians]);
    }
    if (!lbData.touchLight && !lbData.cancelLight) {
      lbData.cancelLight = checkTouchWithObjectsArray(lbData.x, lbData.y, 8, 8, [gameData.walls]);
    }
    if (!lbData.touchLight && !lbData.cancelLight) {
      lbData.cancelLight = checkTouchWithObjectsArray(lbData.x, lbData.y, 8, 8, [gameData.floors]);
    }
    if (!lbData.cancelLight) {
      lbData.x += moveX;
      lbData.y += moveY;
    }
  }
} // checkTurnLightBeam

function canMove(moveX, moveY) {
  return !checkTouchWithObjectsArray(gameData.willy[0].x+moveX, gameData.willy[0].y+moveY, 10, 16, [gameData.walls, gameData.barriers]);
} // canMove

function checkTouchItems() {
  var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.items]);
  if (touchId) {
    gameData.items[touchId-1].hide = true;
    completed++;
    gameData.info[6] += 100;
    if (completed == gameData.items.length) {
      var portal = gameData.portal[0];
      portal.flashShiftFrames = 1;
      if ('actions' in portal) {
        var actions = portal.actions;
        actions.forEach((action) => {
          switch(action.type) {
            case 'setValue':
              gameData[action.objectsArray][action.index][action.variable] = action.value;
              break;
            case 'action':
              gameData[action.objectsArray][action.index].action = action.value
              break;
          }
        });
      }
    }
    postMessage({id: 'playSound', channel: 'extra', sound: 'itemSound'});
  }
} // checkTouchItems

function checkCrash() {
  if (checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.nasties, gameData.guardians])) {
    gameData.info[5] = true;
  }
  if (checkStandingWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.nasties]).length) {
    gameData.info[5] = true;
  }
} // checkCrash

function checkTouchPortal() {
  if (gameData.portal[0].flashShiftFrames) {
    var willy = gameData.willy[0];
    var portal = gameData.portal[0];
    if (!(willy.x+willy.width <= portal.x+8 || willy.y+willy.height <= portal.y+8 || willy.x >= portal.x+portal.width-8 || willy.y >= portal.y+portal.height-8)) {
      postMessage({id: 'caveDone', gameData: gameData});
    }
  }
} // checkTouchPortal

function checkTouchLightBeam() {
  if ('lightBeam' in gameData) {
    var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.lightBeam]);
    if (touchId) {
      gameData.info[7] += 4;
    }
  }
} // checkTouchLightBeam

function checkTouchSwitches() {
  var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.switches]);
  if (touchId) {
    if (gameData.switches[touchId-1].frame == 0) {
      gameData.switches[touchId-1].frame = 1;
      var actions = gameData.switches[touchId-1].actions;
      actions.forEach((action) => {
        switch(action.type) {
          case 'setValue':
            gameData[action.objectsArray][action.index][action.variable] = action.value;
            break;
          case 'bonus':
            bonus += action.value;
            break;
          case 'playSound':
            postMessage({id: 'playSound', channel: action.channel, sound: action.sound, options: action.options});
            break;
        }
      });
    }
  }
} // checkTouchSwitches

onmessage = (event) => {
  switch (event.data.id) {
    case 'init':
      gameData = {};
      Object.keys(event.data.initData).forEach((objectsType) => {
        gameData[objectsType] = [];
        if (objectsType != 'info') {
          event.data.initData[objectsType].forEach((object) => {
            gameData[objectsType].push({...object});
          });
        } else {
          gameData.info = [...event.data.initData.info];
        }
      });
      gameLoop();
      break;

    case 'controls':
      controls[event.data.action] = event.data.value;
      break;
  
    }
} // onmessage
