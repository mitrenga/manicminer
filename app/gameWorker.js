/**/

/*/

/**/
// begin code

var counter = 0;
var counter2 = 0;
var counter4 = 0;
var counter6 = 0;
var gameData = null;
var controls = {'left': false, 'right': false, 'jump': false};
var jumpCounter = 0;
var jumpDirection = 0;
var jumpMap = [-4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var fallingCounter = 0;

function gameLoop() {
  setTimeout(gameLoop, 80);
  
  if (gameData != null) {
    counter++;
    if (counter%2 == 0) {
      counter2++;
    }
    if (counter%4 == 0) {
      counter4++;
    }
    if (counter%6 == 0) {
      counter6++;
    }

    // conveyors
    gameData.conveyors.forEach((conveyor) => {
      if (conveyor.frame == 3) {
        conveyor.frame = 0;
      } else {
        conveyor.frame++;
      }  
    });

    // items
    gameData.items.forEach((item) => {
      if (item.frame == 3) {
        item.frame = 0;
      } else {
        item.frame++;
      }  
    });

    // Willy
    if (!gameData.info[4]) { // if not demo
      
      if (jumpCounter == jumpMap.length) {
        jumpCounter = 0;
        jumpDirection = 0;
        fallingCounter = 1;
      }      

      var standingOn = checkStandingWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.walls, gameData.floors, gameData.crumblingFloors, gameData.conveyors]);

      standingOn.forEach((object) => {
        if ('crumbling' in object) {
          if (object.frame < 7) {
            object.frame++;
          } else {
            object.hide = true;
          }
        }
      });

      if (fallingCounter) {
        if (standingOn.length) {
          fallingCounter = 0;
        } else {
          gameData.willy[0].y += 4;
          fallingCounter++;
        }
      } else {
        if (jumpCounter == 0 && standingOn.length == 0) {
          fallingCounter = 1;
        }
      }

      if (jumpCounter && jumpMap[jumpCounter] >= 0) {
        if (standingOn.length) {
          jumpCounter = 0;
          jumpDirection = 0;
          postMessage({'id': 'stopChannel', 'channel': 'sounds'});
        }
      }

      if (jumpCounter > 0) {
        if (jumpMap[jumpCounter] > 0 || canMove(0, jumpMap[jumpCounter])) {
          jumpCounter++;
          gameData.willy[0].y += jumpMap[jumpCounter-1]; 
        } else {
          jumpCounter = 0;
          jumpDirection = 0;
          fallingCounter = 1;
          postMessage({'id': 'stopChannel', 'channel': 'sounds'});
        }
      }

      if ((controls.right && !controls.left && jumpCounter == 0 && fallingCounter == 0) || (jumpCounter > 0 && jumpDirection == 1)) {
        if (gameData.willy[0].direction == 1) {
          gameData.willy[0].direction = 0;
        } else {
          jumpDirection = 1;
          if (canMove(2, 0)) {
            gameData.willy[0].x += 2;
            if (gameData.willy[0].frame == 3) {
              gameData.willy[0].frame = 0;
            } else {
              gameData.willy[0].frame++;
            }
          }
        }
      }

      if ((controls.left && !controls.right && jumpCounter == 0 && fallingCounter == 0) || (jumpCounter > 0 && jumpDirection == -1)) {
        if (gameData.willy[0].direction == 0) {
          gameData.willy[0].direction = 1;
        } else {
          jumpDirection = -1;
          if (canMove(-2, 0)) {
            gameData.willy[0].x -= 2;
            if (gameData.willy[0].frame == 0) {
              gameData.willy[0].frame = 3;
            } else {
              gameData.willy[0].frame--;
            }
          }
        }
      }

      if (jumpCounter == 0 && fallingCounter == 0 && controls.jump) {
        if (canMove(0, jumpMap[jumpCounter])) {
          jumpCounter = 1;
          gameData.willy[0].y += jumpMap[jumpCounter-1]; 
          postMessage({'id': 'playSound', 'channel': 'sounds', 'sound': 'jumpSound'});
        }
      }

      if (jumpCounter == 0) {
        jumpDirection = 0;
      }
    }

    // guardians
    gameData.guardians.forEach((guardian) => {
      switch (guardian.type) {
        case 'horizontal':
          var toMove = false;
          switch (guardian.speed) {
            case 0:
              toMove = true;
              break;
            case 1:
              if (this.counter%2 == 0) {
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
          break;        

        case 'forDropping':
          if (counter%8 == 0) {
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

    // light beam
    if ('lightBeam' in gameData) {
      var lbData = {'x': 0, 'y': 0, 'cancel': false, 'touch': false};
      var part = -1;
      lbData.cancelLight = false;
      while (!lbData.cancelLight) {
        lbData.touchLight = false;
        part++;
        if (part%2 == 0) { // to down
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
          checkLightBeamTouch(lbData, 0, 8);
          gameData.lightBeam[part].width = 8;
          gameData.lightBeam[part].height = lbData.y-gameData.lightBeam[part].y;
        } else { // to left
          lbData.x = gameData.lightBeam[part-1].x-8;
          lbData.y = gameData.lightBeam[part-1].y+gameData.lightBeam[part-1].height-8;
          gameData.lightBeam[part].x = lbData.x;
          gameData.lightBeam[part].y = lbData.y;
          gameData.lightBeam[part].hide = false;
          checkLightBeamTouch(lbData, -8, 0);
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

    if (!gameData.info[4]) { // if not demo
      checkTouchItems();
      checkCrash();
      checkTouchPortal();
      checkTouchLightBeam();
    }

    // game counters
    gameData.info[0] = counter;
    gameData.info[1] = counter2;
    gameData.info[2] = counter4;
    gameData.info[3] = counter6;
  }

  postMessage({'id': 'update', 'gameData': gameData});
} // gameLoop

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

function checkStandingWithObjectsArray(x, y, width, height, objectsArray) {
  var result = [];
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

function checkLightBeamTouch(lbData, moveX, moveY) {
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
} // checkLightBeamTouch

function canMove(moveX, moveY) {
  return !checkTouchWithObjectsArray(gameData.willy[0].x+moveX, gameData.willy[0].y+moveY, 10, 16, [gameData.walls]);
} // canMove

function checkTouchItems() {
  var touchId = checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.items]);
  if (touchId) {
    gameData.items[touchId-1].hide = true;
    postMessage({'id': 'playSound', 'channel': 'extra', 'sound': 'itemSound'});
  }
} // checkTouchItems

function checkCrash() {
  if (checkTouchWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.nasties, gameData.guardians])) {
    gameData.info[5] = true;
  }
  return 0;
} // checkCrash

function checkTouchPortal() {
  if (checkInsideWithObjectsArray(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.portal])) {
    console.log('portal');
  }
} // checkTouchPortal

function checkTouchLightBeam() {
} // checkTouchLightBeam

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
