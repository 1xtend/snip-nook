import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  formatRawCode(code: string): string {
    return code.replace(/\r\n/g, '\r\n');
  }

  formatProcessedCode(code: string): string {
    return code.replace(/\\r\\n/g, '\r\n');
  }
}
