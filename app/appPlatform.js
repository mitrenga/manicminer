/**/
const { ZXSpectrum48KPlatform } = await import('./svision/js/platform/zxSpectrum/zxSpectrum48KPlatform.js?ver='+window.srcVersion);
/*/
import ZXSpectrum48KPlatform from './svision/js/platform/zxSpectrum/zxSpectrum48KPlatform.js';
/**/
// begin code

export var appPlatform = new ZXSpectrum48KPlatform();

export default appPlatform;