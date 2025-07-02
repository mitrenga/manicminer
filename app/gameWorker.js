/**/

/*/

/**/
// begin code

var counter = 0;
var counter2 = 0;
var counter4 = 0;
var counter6 = 0;
var gameData = null;

function gameLoop() {
  setTimeout(gameLoop, 72);
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
                guardian.frame = guardian.frames-guardian.frame-1;
              }
              break;
            case 1:
              if (guardian.y-guardian.speed <= guardian.limitUp) {
                guardian.direction = 0;
                guardian.frame = guardian.frames-guardian.frame-1;
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
  }

  // light beam
  if ('lightBeam' in gameData) {
    var part = -1;
    var cancelLight = false;
    while (!cancelLight) {
      var touchLight = false;
      part++;
      if (part%2 == 0) { // to down
        var posX = gameData.lightBeam[0].x;
        var posY = gameData.lightBeam[0].y;
        if (part > 0) {
          posX = gameData.lightBeam[part-1].x;
          posY = gameData.lightBeam[part-1].y+gameData.lightBeam[part-1].height;
        }
        gameData.lightBeam[part].x = posX;
        gameData.lightBeam[part].y = posY;
        gameData.lightBeam[part].width = 8;
        gameData.lightBeam[part].height = 8;
        gameData.lightBeam[part].hide = false;
        while (!touchLight && !cancelLight) {
          if (!touchLight && !cancelLight) {
            touchLight = checkTouch(gameData.guardians, posX, posY);
          }
          if (!touchLight && !cancelLight) {
            cancelLight = checkTouch(gameData.wall, posX, posY);
          }
          if (!touchLight && !cancelLight) {
            cancelLight = checkTouch(gameData.floor, posX, posY);
          }
          if (!cancelLight) {
            posY += 8;
          }
        }
        gameData.lightBeam[part].width = 8;
        gameData.lightBeam[part].height = posY-gameData.lightBeam[part].y;
      } else { // to left
        var posX = gameData.lightBeam[part-1].x-8;
        var posY = gameData.lightBeam[part-1].y+gameData.lightBeam[part-1].height-8;
        gameData.lightBeam[part].x = posX;
        gameData.lightBeam[part].y = posY;
        gameData.lightBeam[part].hide = false;
        while (!touchLight && !cancelLight) {
          if (!touchLight && !cancelLight) {
            touchLight = checkTouch(gameData.guardians, posX, posY);
          }
          if (!touchLight && !cancelLight) {
            cancelLight = checkTouch(gameData.wall, posX, posY);
          }
          if (!touchLight && !cancelLight) {
            cancelLight = checkTouch(gameData.floor, posX, posY);
          }
          if (!cancelLight) {
            posX -= 8;
          }
        }
        gameData.lightBeam[part].width = gameData.lightBeam[part].x-posX;
        gameData.lightBeam[part].x = posX+8;
        gameData.lightBeam[part].height = 8;
      }
    }
    // reset & hide unused parts
    for (var p = part+1; p < gameData.lightBeam.length; p++) {
      gameData.lightBeam[p].x = 0;
      gameData.lightBeam[p].y = 0;
      gameData.lightBeam[p].width = 0;
      gameData.lightBeam[p].height = 0;
      gameData.lightBeam[p].hide = true;
    }
  }

  // game counters
  gameData.info[0] = counter;
  gameData.info[1] = counter2;
  gameData.info[2] = counter4;
  gameData.info[3] = counter6;

  postMessage({'id': 'update', 'gameData': gameData});
} // gameLoop

function checkTouch(objects, posX, posY) {
  for (var o = 0; o < objects.length; o++) {
    var obj = objects[o];
    if (!(posX+8 <= obj.x || posY+8 <= obj.y || posX >= obj.x+obj.width || posY >= obj.y+obj.height)) {
      return true;
    }
  }
  return false;
} // checkTouch

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
  }
} // onmessage
