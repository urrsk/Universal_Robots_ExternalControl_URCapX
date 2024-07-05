import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExternalControlApplicationComponent} from "./external-control-application.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('ExternalControlApplicationComponent', () => {
  let fixture: ComponentFixture<ExternalControlApplicationComponent>;
  let component: ExternalControlApplicationComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalControlApplicationComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalControlApplicationComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});