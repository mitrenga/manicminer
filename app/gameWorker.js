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
  gameData.info[0] = counter;
  gameData.info[1] = counter2;
  gameData.info[2] = counter4;
  gameData.info[3] = counter6;
  postMessage({'id': 'update', 'gameData': gameData});
} // gameLoop

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
