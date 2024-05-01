import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { snippetOwnerGuard } from './snippet-owner.guard';

describe('snippetOwnerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => snippetOwnerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
