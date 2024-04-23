import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  transform(text: string, max: number, dots: boolean = true): unknown {
    if (text.length <= max) {
      return text;
    }

    const truncatedText = text.substring(0, max);

    return dots ? truncatedText + '...' : truncatedText;
  }
}
