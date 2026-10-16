const { ZXVideoRAMEntity } = await import('./svision/js/platform/canvas2D/zxSpectrum/zxVideoRAMEntity.js?ver='+window.srcVersion);
// begin code

/**
 * The title picture of the original: the top 16 character rows of its screen,
 * kept in data/intro.json as video memory — 6912 bytes as the machine holds
 * them (`videoRAM`, base64), of which the picture uses the bitmap of the first
 * two thirds and the first 16 rows of attributes.
 *
 * It is shown as what it is: {@link ZXVideoRAMEntity} paints it the way the ULA
 * does, and `restore()` takes the data file whole. The file comes with appData
 * (db/appData.php) and is read back from localStorage in init(), the same way
 * every cave reads its own file; that read is synchronous, so the picture is
 * there on the first draw. Until 2026-09-06 the same bytes sat in this file as
 * 144 lines of hex and were painted here by hand, one `fillRect` per cell of
 * paper and one per set bit.
 *
 * The children (the piano keys, the ENTER sign, Willy) are drawn over it.
 */
export class MainImageEntity extends ZXVideoRAMEntity {

  constructor(parentEntity, x, y, width, height) {
    super(parentEntity, x, y, {col: 0, row: 0, cols: width/8, rows: height/8});
    this.id = 'MainImageEntity';
  } // constructor

  init() {
    super.init();
    this.fetchData('intro.data', {key: 'intro', when: 'required'}, {});
  } // init

  /**
   * Takes the picture when it arrives — from localStorage at init, or from the
   * server when it was not there — and passes whatever comes on to the children
   * as every entity does.
   * @param {Object} data - {url, source, data}; the picture has `data.videoRAM`.
   */
  setData(data) {
    if (data && data.data && data.data.videoRAM) {
      this.restore(data.data);
    }
    super.setData(data);
  } // setData

} // MainImageEntity
