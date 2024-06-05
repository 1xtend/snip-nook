import { Observable, OperatorFunction } from 'rxjs';

export function hasFormChanged<T>(
  initialValue: any,
): OperatorFunction<T, boolean> {
  return (source: Observable<any>) =>
    new Observable((observer) => {
      return source.subscribe({
        next: (value) => {
          const result = Object.keys(value).some((key) => {
            const value1 = value[key];
            const value2 = initialValue[key];

            if (Array.isArray(value1) && Array.isArray(value2)) {
              return compareArrays(value1, value2);
            }

            if (typeof value1 === 'object' && typeof value2 === 'object') {
              return compareObjects(value1, value2);
            }

            if (typeof value1 === 'string' && typeof value2 === 'string') {
              return value1.trim() !== value2.trim();
            }

            return value1 !== value2;
          });

          observer.next(result);
        },
        error: observer.error,
        complete: observer.complete,
      });
    });
}

function compareArrays(arr1: any[], arr2: any[]): boolean {
  const array1 = arr1
    .map((value) => {
      if (typeof value === 'object') {
        return Object.entries(value).sort();
      }
      return value;
    })
    .sort();

  const array2 = arr2
    .map((value) => {
      if (typeof value === 'object') {
        return Object.entries(value).sort();
      }
      return value;
    })
    .sort();

  return JSON.stringify(array1) !== JSON.stringify(array2);
}

function compareObjects(obj1: any, obj2: any): boolean {
  const array1 = Object.entries(obj1).sort();
  const array2 = Object.entries(obj2).sort();

  return JSON.stringify(array1) !== JSON.stringify(array2);
}
