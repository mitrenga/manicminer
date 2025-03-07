/*/

/*/

/**/

export class AbstractPlatform {
  
  constructor() {
  } // constructor

  desktop() {
    return {width: 0, height: 0, defaultColor: false};
  } // resolution

  border() {
    return {minimal: 0, optimal: 0, defaultColor: false};
  }

  colorByName(colorName) {
    return false;
  } // colorByName

  color(color) {
    return false;
  } // color

  penColorByAttribut(attr) {
    return false;
  } // penColorByAttribut

  bkColorByAttribut(attr) {
    return false;
  } // bkColorByAttribut

} // class AbstractPlatform

export default AbstractPlatform;
