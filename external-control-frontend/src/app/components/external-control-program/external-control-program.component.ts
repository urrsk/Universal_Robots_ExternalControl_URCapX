import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProgramBehaviorAPI, ProgramPresenter, ProgramPresenterAPI, RobotSettings } from '@universal-robots/contribution-api';
import { ExternalControlProgramNode } from './external-control-program.node';
import { first } from 'rxjs/operators';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { ExternalControlApplicationNode } from '../external-control-application/external-control-application.node';

@Component({
    templateUrl: './external-control-program.component.html',
    styleUrls: ['./external-control-program.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ExternalControlProgramComponent implements OnChanges, ProgramPresenter {
    // presenterAPI is optional
    @Input() presenterAPI: ProgramPresenterAPI;
    private _contributedNode: ExternalControlProgramNode;
    // robotSettings is optional
    @Input() robotSettings: RobotSettings;
    // contributedNode is optional
    @Input()
    contributedNode: ExternalControlProgramNode;

    constructor(
        protected readonly translateService: TranslateService,
        protected readonly cd: ChangeDetectorRef


    ) {
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
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
        }
        if (changes?.presenterAPI.isFirstChange() && this.presenterAPI) {
            const applicationNode = await this.presenterAPI.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
            if (applicationNode && this.contributedNode) {
                this.contributedNode.parameters.port = applicationNode.port;
                this.contributedNode.parameters.robotIP = applicationNode.robotIP;
            }

            this.cd.detectChanges();
        }
    }

    // call saveNode to save node parameters
    async saveNode() {
        this.cd.detectChanges();
        await this.presenterAPI.programNodeService.updateNode(this.contributedNode);
    }

    getPortDisplay() {
        return this.contributedNode.parameters.port
    }

    getIPDisplay() {
        return this.contributedNode.parameters.robotIP;
    }
}
