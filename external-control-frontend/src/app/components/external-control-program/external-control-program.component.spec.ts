import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExternalControlProgramComponent} from "./external-control-program.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('ExternalControlProgramComponent', () => {
  let fixture: ComponentFixture<ExternalControlProgramComponent>;
  let component: ExternalControlProgramComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalControlProgramComponent],
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

    fixture = TestBed.createComponent(ExternalControlProgramComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
