import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ApplicationPresenterAPI, ApplicationPresenter, RobotSettings } from '@universal-robots/contribution-api';
import { ExternalControlApplicationNode } from './external-control-application.node';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import {BehaviorSubject} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
    templateUrl: './external-control-application.component.html',
    styleUrls: ['./external-control-application.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ExternalControlApplicationComponent implements ApplicationPresenter, OnChanges {
    // applicationAPI is optional
    @Input() applicationAPI: ApplicationPresenterAPI;
    messageEmitter$ = new BehaviorSubject<string>('');
    httpOptions: {
        headers?:
            | HttpHeaders
            | {
            [header: string]: string | string[];
        };
        observe?: 'body' | undefined;
        responseType?: 'json' | undefined;
    }
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    // applicationNode is required
    @Input() applicationNode: ExternalControlApplicationNode;
    private readonly backendProtocol = location.protocol;
    private backendUrl: string;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef,
        protected readonly httpClient: HttpClient
    ) {
        const headers = new HttpHeaders();
        headers.append('Accept', 'text/html');
        this.httpOptions = {
            headers,
            observe: 'body',
            // @ts-ignore Ignored due to missing types
            responseType: 'text',
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.robotSettings) {
            if (!changes?.robotSettings?.currentValue) {
                return;
            }

            if (changes?.robotSettings?.isFirstChange()) {
                if (changes?.robotSettings?.currentValue) {
                    this.translateService.use(changes?.robotSettings?.currentValue?.language);
                }
                this.translateService.setDefaultLang('en');
            }

            this.translateService
                .use(changes?.robotSettings?.currentValue?.language)
                .pipe(first())
                .subscribe(() => {
                    this.cd.detectChanges();
                });
                this.backendUrl = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'external-control-backend', 'rest-api');
        }
    }

    writeParam(port: number, robotIP: string): void {
        this.applicationNode.port = port;
        this.applicationNode.robotIP = robotIP;
        this.saveNode();

    }

    // call saveNode to save node parameters
    saveNode() {
        this.cd.detectChanges();
        this.applicationAPI.applicationNodeService.updateNode(this.applicationNode);
    }
}
