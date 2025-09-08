// pdf-init.ts
import pdfMake from 'pdfmake/build/pdfmake';
let initialized = false;

export function getPdfMake(): any {
  if (initialized) return (window as any).pdfMake;

  // Bind the module instance to the global used by the browser build
  (window as any).pdfMake = pdfMake as any;

  const host: any = (window as any).pdfMake; // canonical instance

  // Register font families on the SAME host
  host.fonts = {
    Battambang: {
      normal:  `${window.location.origin}/fonts/Battambang-Regular.ttf`,
      bold: `${window.location.origin}/fonts/Battambang-Bold.ttf`,
      italics:  `${window.location.origin}/fonts/Battambang-Regular.ttf`, // map if you don’t have true italics
      bolditalics:  `${window.location.origin}/fonts/Battambang-Bold.ttf`,
      light:  `${window.location.origin}/fonts/Battambang-Light.ttf`,
      thin:  `${window.location.origin}/fonts/Battambang-Thin.ttf`,
      black:  `${window.location.origin}/fonts/Battambang-Black.ttf`,
    },
  };

  // (Optional) mirror back onto the module object for safety
  (pdfMake as any).vfs = host.vfs;
  (pdfMake as any).fonts = host.fonts;
  initialized = true;
  return host;
}
