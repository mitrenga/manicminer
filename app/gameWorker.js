/**/

/*/

/**/
// begin code

var controls = {
  left: false,
  right: false,
  jump: false,
  isLeft: function() {
    if (this.left && !this.right) {
      return true;
    }
    return false;
  },
  isRight: function() {
    if (this.right && !this.left) {
      return true;
    }
    return false;
  },
  isJump: function() {
    return this.jump;
  }
};

var jumpMap = [-4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
var framesInterval = 80;

var counter, counter2, counter4, counter6, gameData,
    jumpCounter, jumpDirection, fallingCounter, fallingDirection,
    mustMovingDirection, canMovingDirection, previousDirection,
    completed, bonus, pause, loopCounter,nextLoop, ended;

/**
 * Resets all module-level game state to its initial values, ready for a new
 * cave run. The `controls` object is intentionally left untouched here so any
 * held keys survive a restart.
 * @returns {void}
 */
function resetData() {
  counter = 0;
  counter2 = 0;
  counter4 = 0;
  counter6 = 0;
  gameData = null;
  jumpCounter = 0;
  jumpDirection = 0;
  fallingCounter = 0;
  fallingDirection = 0;
  mustMovingDirection = 0;
  canMovingDirection = 0;
  previousDirection = 0;
  completed = 0;
  bonus = 0;
  pause = false;
  loopCounter = 0;
  nextLoop = false;
  ended = false;
} // resetData

/**
 * Main game tick. Schedules the next frame (unless paused or ended), advances
 * the frame counters (gameData.info[0..3]), runs every per-frame subsystem
 * (conveyors, items, Willy, guardians, light beam, barriers and the collision
 * checks) and posts the updated gameData back to the main thread.
 * @returns {void}
 */
function gameLoop() {
  loopCounter++;
  if (ended) {
    nextLoop = false;
    return;
  }
  if (!pause) {
    nextLoop = setTimeout(gameLoop, framesInterval);
  } else {
    nextLoop = false;
  }

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
      isTouchingItem();
      isColliding();
      isOnPlatform();
      isTouchingLightBeam();
      isTouchingSwitch();
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

    if (!ended) {
      postMessage({id: 'update', gameData: gameData});
    }
  }
} // gameLoop

/**
 * Advances every conveyor's animation frame (cycles 0→3).
 * @returns {void}
 */
function conveyors() {
  gameData.conveyors.forEach((conveyor) => {
    if (conveyor.frame == 3) {
      conveyor.frame = 0;
    } else {
      conveyor.frame++;
    }  
  });
} // conveyors

/**
 * Advances every collectable item's animation frame (cycles 0→3).
 * @returns {void}
 */
function items() {
  gameData.items.forEach((item) => {
    if (item.frame == 3) {
      item.frame = 0;
    } else {
      item.frame++;
    }  
  });
} // items

/**
 * Updates Willy for the current frame: resolves what he is standing on, applies
 * falling/gravity, the jump arc (jumpMap), conveyor-forced movement and
 * left/right walking from the controls, plays the matching sounds and may set
 * the crash flag on a hard landing. Mutates gameData.willy[0] and the
 * module-level movement state.
 * @returns {void}
 */
function willy() {
  var willy = gameData.willy[0];

  if (jumpCounter == jumpMap.length) {
    jumpCounter = 0;
    fallingDirection = jumpDirection;
    jumpDirection = 0;
    fallingCounter = 5;
  }      

  canMovingDirection = 0;

  var standing = isStandingOn(willy.x, willy.y, 10, 16, [gameData.walls, gameData.floors, gameData.crumblingFloors, gameData.conveyors]);

  standing.forEach((object) => {
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
    if (standing.length) {
      if (fallingCounter > 9) {
        gameData.info[5] = true;
      }
      fallingCounter = 0;
      if (canMovingDirection == fallingDirection) {
        mustMovingDirection = canMovingDirection;
      }
      fallingDirection = 0;
      postMessage({id: 'stopAudioBus', bus: 'sounds'});
    } else {
      willy.y += 4;
      fallingCounter++;
    }
  } else {
    if (!jumpCounter && !standing.length) {
      fallingCounter = 1;
      fallingDirection = 0;
      postMessage({id: 'playSound', bus: 'sounds', sound: 'fallingSound'});
    }
  }

  if (jumpCounter && jumpMap[jumpCounter] >= 0) {
    if (standing.length) {
      jumpCounter = 0;
      if (canMovingDirection == jumpDirection) {
        mustMovingDirection = canMovingDirection;
      }
      jumpDirection = 0;
      postMessage({id: 'stopAudioBus', bus: 'sounds'});
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
      postMessage({id: 'playSound', bus: 'sounds', sound: 'fallingSound'});
    }
  }

  if (canMovingDirection == 1 && !controls.isLeft()) {
    mustMovingDirection = 1;
  }
  if (canMovingDirection == -1 && !controls.isRight()) {
    mustMovingDirection = -1;
  }

  var newDirection = 0;
  if ((controls.isRight() && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == -1 && previousDirection == 1))) ||
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

  if ((controls.isLeft() && !jumpCounter && !fallingCounter && !mustMovingDirection && (!canMovingDirection || (canMovingDirection == 1 && previousDirection == -1))) ||
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

  if (!jumpCounter && !fallingCounter && controls.isJump()) {
    if (canMove(0, jumpMap[jumpCounter])) {
      jumpCounter = 1;
      willy.y += jumpMap[jumpCounter-1]; 
      postMessage({id: 'playSound', bus: 'sounds', sound: 'jumpSound'});
    }
  }

  if (!jumpCounter) {
    jumpDirection = 0;
  }
} // willy

/**
 * Advances every guardian according to its `type` (horizontal, vertical,
 * forDropping, falling): updates position, animation frame and direction,
 * reversing at its movement limits.
 * @returns {void}
 */
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
            if (!(counter%2)) {
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

/**
 * Recomputes the segmented light beam for the current frame. Starting at the
 * source it traces alternating downward/leftward segments (via
 * doesLightBeamHit) until one is blocked by a wall or floor, sizing each
 * gameData.lightBeam part and hiding any unused trailing parts.
 * @returns {void}
 */
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
        doesLightBeamHit(lbData, 0, 8);
        gameData.lightBeam[part].width = 8;
        gameData.lightBeam[part].height = lbData.y-gameData.lightBeam[part].y;
      } else { // to left
        lbData.x = gameData.lightBeam[part-1].x-8;
        lbData.y = gameData.lightBeam[part-1].y+gameData.lightBeam[part-1].height-8;
        gameData.lightBeam[part].x = lbData.x;
        gameData.lightBeam[part].y = lbData.y;
        gameData.lightBeam[part].hide = false;
        doesLightBeamHit(lbData, -8, 0);
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

/**
 * Advances any opening barrier's animation; once a barrier finishes opening it
 * is hidden and its configured `actions` (e.g. setValue) are applied to
 * gameData.
 * @returns {void}
 */
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

/**
 * Axis-aligned bounding-box overlap test of the rectangle (x, y, width, height)
 * against every non-hidden object in the given lists.
 * @param {number} x - Left edge of the test rectangle.
 * @param {number} y - Top edge of the test rectangle.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {Array<Array<{x:number,y:number,width:number,height:number,hide?:boolean}>>} objectsArray - Lists of objects to test against.
 * @returns {number} 1-based index of the first overlapping object within its list, or 0 if none overlap.
 */
function isTouching(x, y, width, height, objectsArray) {
  for (var a = 0; a < objectsArray.length; a++) {
    var objects = objectsArray[a];
    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o];
      if (!('hide' in obj) || !obj.hide) {
        var x1 = obj.x;
        var x2 = obj.x+obj.width;
        var y1 = obj.y;
        var y2 = obj.y+obj.height;
        if (!(x+width <= x1 || y+height <= y1 || x >= x2 || y >= y2)) {
          return o+1;
        }
      }
    }
  }
  return 0;
} // isTouching

/*
 * Like isTouching, but tests full containment: returns whether the rectangle
 * (x, y, width, height) lies entirely inside a non-hidden object. Currently
 * unused (the whole function is disabled).
 * @param {number} x - Left edge of the test rectangle.
 * @param {number} y - Top edge of the test rectangle.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {Array<Array<{x:number,y:number,width:number,height:number,hide?:boolean}>>} objectsArray - Lists of objects to test against.
 * @returns {number} 1-based index of the first containing object within its list, or 0 if none contain it.
 *
function isInside(x, y, width, height, objectsArray) {
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
} // isInside
*/

/**
 * Finds the objects the rectangle (x, y, width, height) is resting on — those
 * it overlaps horizontally and whose top edge its bottom edge sits exactly on.
 * Returns an empty list while Willy is ascending in a jump.
 * @param {number} x - Left edge.
 * @param {number} y - Top edge.
 * @param {number} width - Rectangle width.
 * @param {number} height - Rectangle height.
 * @param {Array<Array<object>>} objectsArray - Lists of objects to test against.
 * @returns {object[]} The objects being stood on (possibly empty).
 */
function isStandingOn(x, y, width, height, objectsArray) {
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
} // isStandingOn

/**
 * Marches the light-beam probe in (moveX, moveY) steps until it hits a guardian
 * (sets lbData.touchLight) or is blocked by a wall or floor (sets
 * lbData.cancelLight), advancing lbData.x/lbData.y in place.
 * @param {{x:number,y:number,touchLight:(number|boolean),cancelLight:(number|boolean)}} lbData - Probe state, mutated in place.
 * @param {number} moveX - Horizontal step per iteration.
 * @param {number} moveY - Vertical step per iteration.
 * @returns {void}
 */
function doesLightBeamHit(lbData, moveX, moveY) {
  while (!lbData.touchLight && !lbData.cancelLight) {
    if (!lbData.touchLight && !lbData.cancelLight) {
      lbData.touchLight = isTouching(lbData.x, lbData.y, 8, 8, [gameData.guardians]);
    }
    if (!lbData.touchLight && !lbData.cancelLight) {
      lbData.cancelLight = isTouching(lbData.x, lbData.y, 8, 8, [gameData.walls]);
    }
    if (!lbData.touchLight && !lbData.cancelLight) {
      lbData.cancelLight = isTouching(lbData.x, lbData.y, 8, 8, [gameData.floors]);
    }
    if (!lbData.cancelLight) {
      lbData.x += moveX;
      lbData.y += moveY;
    }
  }
} // doesLightBeamHit

/**
 * Tests whether Willy could move by (moveX, moveY) without his 10×16 body
 * entering a wall or barrier.
 * @param {number} moveX - Horizontal offset to test.
 * @param {number} moveY - Vertical offset to test.
 * @returns {boolean} True if the target position is clear.
 */
function canMove(moveX, moveY) {
  return !isTouching(gameData.willy[0].x+moveX, gameData.willy[0].y+moveY, 10, 16, [gameData.walls, gameData.barriers]);
} // canMove

/**
 * If Willy overlaps a collectable item, hides it, awards points and advances
 * the completed-items count; collecting the last item activates the portal and
 * runs its configured actions.
 * @returns {void}
 */
function isTouchingItem() {
  var touchId = isTouching(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.items]);
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
    postMessage({id: 'playSound', bus: 'extra', sound: 'itemSound'});
  }
} // isTouchingItem

/**
 * Maps a sprite's logical (frame, direction) to the flat index used by
 * per-frame data such as blankMargins, matching the frame+direction layout used
 * when the sprite is drawn. Falls back to direction 0 when the object has fewer
 * directions than its current `direction`.
 * @param {{frame:number,direction:number,directions:number,frames:number}} obj - The sprite-bearing object.
 * @returns {number} The flat frame index.
 */
function collisionFrameIndex(obj) {
  var d = obj.direction;
  if (d+1 > obj.directions) {
    d = 0;
  }
  return obj.frame+d*obj.frames;
} // collisionFrameIndex

/**
 * Tests whether the local pixel (x, y) is solid according to a blank-margin
 * map. A pixel is solid when it lies inside both the row span (left/right) and
 * the column span (top/bottom), so interior holes count as solid.
 * @param {{left:number[],right:number[],top:number[],bottom:number[]}} map - Blank-margin map for one sprite frame.
 * @param {number} x - Local x within the sprite.
 * @param {number} y - Local y within the sprite.
 * @returns {boolean} True if the pixel is solid.
 */
function isMarginSolid(map, x, y) {
  var width = map.top.length;
  var height = map.left.length;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return false;
  }
  return map.left[y] <= x && x < width-map.right[y] && map.top[x] <= y && y < height-map.bottom[x];
} // isMarginSolid

/**
 * Pixel-perfect collision test between two sprites. Broad phase: intersect
 * their paint-corrected pixel rectangles; narrow phase: scan the overlap for a
 * pixel that is solid in both sprites' blank-margin maps. Returns false if
 * either sprite has no blankMargins.
 * @param {object} a - First sprite (needs blankMargins, x, y, frame/direction).
 * @param {object} b - Second sprite (same requirements).
 * @returns {boolean} True if the sprites overlap on a mutually solid pixel.
 */
function isPixelColliding(a, b) {
  if (!a.blankMargins || !b.blankMargins) {
    return false;
  }
  var ma = a.blankMargins[collisionFrameIndex(a)];
  var mb = b.blankMargins[collisionFrameIndex(b)];
  var ba = paintCorrectedBox(a);
  var bb = paintCorrectedBox(b);
  var ax = ba.x;
  var ay = ba.y;
  var bx = bb.x;
  var by = bb.y;
  var x0 = Math.max(ax, bx);
  var y0 = Math.max(ay, by);
  var x1 = Math.min(ax+ma.top.length, bx+mb.top.length);
  var y1 = Math.min(ay+ma.left.length, by+mb.left.length);
  for (var y = y0; y < y1; y++) {
    for (var x = x0; x < x1; x++) {
      if (isMarginSolid(ma, x-ax, y-ay) && isMarginSolid(mb, x-bx, y-by)) {
        return true;
      }
    }
  }
  return false;
} // isPixelColliding

/**
 * Computes a sprite's on-screen rectangle. paintCorrections shifts the origin
 * and the renderer compensates the size, so the result matches the region the
 * sprite actually occupies (and that isPixelColliding scans). Sprites without
 * paintCorrections are treated as a zero offset.
 * @param {{x:number,y:number,width:number,height:number,paintCorrections?:{x:number,y:number}}} obj
 * @returns {{x:number,y:number,width:number,height:number}} The corrected rectangle.
 */
function paintCorrectedBox(obj) {
  var px = obj.paintCorrections ? obj.paintCorrections.x : 0;
  var py = obj.paintCorrections ? obj.paintCorrections.y : 0;
  return {x: obj.x+px, y: obj.y+py, width: obj.width-px, height: obj.height-py};
} // paintCorrectedBox

/**
 * Detects whether Willy is killed this frame: a broad-phase bounding-box test
 * against each guardian, confirmed by a pixel-perfect check, plus bounding-box
 * tests against nasties (touching or standing on). On a hit it sets the crash
 * flag (gameData.info[5]) and posts a 'crash' message.
 * @returns {void}
 */
function isColliding() {
  var willy = gameData.willy[0];
  var w = paintCorrectedBox(willy);
  for (var g = 0; g < gameData.guardians.length; g++) {
    var guardian = gameData.guardians[g];
    if (('hide' in guardian) && guardian.hide) {
      continue;
    }
    // Broad phase: paint-corrected bounding-box test; only then confirm pixel-perfect.
    if (isTouching(w.x, w.y, w.width, w.height, [[paintCorrectedBox(guardian)]]) &&
        isPixelColliding(willy, guardian)) {
      gameData.info[5] = true;
      break;
    }
  }
  if (isTouching(willy.x, willy.y, 10, 16, [gameData.nasties])) {
    gameData.info[5] = true;
  }
  if (isStandingOn(willy.x, willy.y, 10, 16, [gameData.nasties]).length) {
    gameData.info[5] = true;
  }
  if (gameData.info[5]) {
    ended = true;
    postMessage({id: 'crash', gameData: gameData});
  }
} // isColliding

/**
 * Once the portal is active (flashing), checks whether Willy overlaps it and,
 * if so, ends the cave with a 'caveDone' message.
 * @returns {void}
 */
function isOnPlatform() {
  if (gameData.portal[0].flashShiftFrames) {
    var willy = gameData.willy[0];
    var portal = gameData.portal[0];
    if (!(willy.x+willy.width <= portal.x+8 || willy.y+willy.height <= portal.y+8 || willy.x >= portal.x+portal.width-8 || willy.y >= portal.y+portal.height-8)) {
      ended = true;
      postMessage({id: 'caveDone', gameData: gameData});
    }
  }
} // isOnPlatform

/**
 * If Willy is within the light beam, increases the light-beam exposure counter
 * (gameData.info[7]).
 * @returns {void}
 */
function isTouchingLightBeam() {
  if ('lightBeam' in gameData) {
    var touchId = isTouching(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.lightBeam]);
    if (touchId) {
      gameData.info[7] += 4;
    }
  }
} // isTouchingLightBeam

/**
 * If Willy touches an un-flipped switch, flips it and runs its configured
 * actions (setValue, bonus, playSound).
 * @returns {void}
 */
function isTouchingSwitch() {
  var touchId = isTouching(gameData.willy[0].x, gameData.willy[0].y, 10, 16, [gameData.switches]);
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
            postMessage({id: 'playSound', bus: action.bus, sound: action.sound, options: action.options});
            break;
        }
      });
    }
  }
} // isTouchingSwitch

/**
 * Worker message handler for commands from the main thread: 'init' (load the
 * initial data and start the loop), 'controls' (update a control flag or
 * predicate), 'pause', 'continue' and 'reset'.
 * @param {MessageEvent} event - Message carrying a `data.id` command and payload.
 * @returns {void}
 */
onmessage = (event) => {
  switch (event.data.id) {
    case 'init':
      clearTimeout(nextLoop);
      resetData();
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
      if (event.data.action.startsWith('is')) {
        controls[event.data.action] = new Function(event.data.value);
      } else {
        controls[event.data.action] = event.data.value;
      }
      break;
    case 'pause':
      pause = true;
      break;

    case 'continue':
      clearTimeout(nextLoop);
      pause = false;
      gameLoop();
      break;
  
    case 'reset':
      clearTimeout(nextLoop);
      nextLoop = false;
      controls.left = false;
      controls.right = false;
      controls.jump = false;
      break;

  }
} // onmessage
