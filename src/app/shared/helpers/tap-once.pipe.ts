import { OperatorFunction, concatMap, of } from 'rxjs';

export function tapOnce<T>(
  callback: (value: T) => void,
  index: number = 0,
): OperatorFunction<T, T> {
  return (source$) =>
    source$.pipe(
      concatMap((value, i) => {
        if (i === index) {
          callback(value);
        }

        return of(value);
      }),
    );
}
