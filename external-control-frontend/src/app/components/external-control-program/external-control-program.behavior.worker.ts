/// <reference lib="webworker" />
import {
    ApplicationContext,
    AdvancedTranslatedProgramLabel,
    AdvancedProgramLabel,
    ProgramBehaviorAPI,
    InsertionContext,
    OptionalPromise,
    ProgramBehaviors,
    ProgramNode,
    registerProgramBehavior,
    ScriptBuilder, ScriptContext,
    ValidationContext,
    ValidationResponse
} from '@universal-robots/contribution-api';
import { ExternalControlProgramNode } from './external-control-program.node';
import { URCAP_ID, VENDOR_ID } from 'src/generated/contribution-constants';
import { ExternalControlApplicationNode } from '../external-control-application/external-control-application.node';

const createProgramNodeLabel = async (node: ExternalControlProgramNode): Promise<AdvancedTranslatedProgramLabel> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const programLabel: AdvancedTranslatedProgramLabel = [];

    programLabel.push({
        type: 'primary',
        translationKey: 'presenter.cache-label',
        interpolateParams: {
            ip: `${applicationNode.robotIP}`,
            port: `${applicationNode.port}`
        }
    });
    return programLabel;
};

const createProgramNode = async (): Promise<ExternalControlProgramNode> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    return ({
        type: 'universal-robots-external-control-external-control-program',
        version: '1.0.0',
        lockChildren: false,
        allowsChildren: false,
    });
};

const fetchBackendJson = async (port: number, robotIP: string, api: ProgramBehaviorAPI): Promise<any> => {
    const url = api.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'external-control-backend', 'rest-api');
    const backendUrl = `${location.protocol}//${url}/${port}/${robotIP}`;
    const response = await fetch(backendUrl);
    if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
    }
    return await response.json();
};

const generateScriptCodeBefore = async (node: ExternalControlProgramNode, ScriptContext: ScriptContext): Promise<ScriptBuilder> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const port = applicationNode.port;
    const robotIP = applicationNode.robotIP;
    const builder = new ScriptBuilder();
    try {
        const json = await fetchBackendJson(port, robotIP, api);
        builder.addRaw(json.program_node || '');
    } catch (e) {
        builder.addRaw('popup("Could not fetch program node from backend.", title="Connection Error!",blocking=True)');
    }
    return builder;
};

const generateScriptCodeAfter = (node: ExternalControlProgramNode): OptionalPromise<ScriptBuilder> => new ScriptBuilder();

const generatePreambleScriptCode = async (node: ExternalControlProgramNode, ScriptContext: ScriptContext): Promise<ScriptBuilder> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const port = applicationNode.port;
    const robotIP = applicationNode.robotIP;
    const builder = new ScriptBuilder();
    try {
        const json = await fetchBackendJson(port, robotIP, api);
        builder.addRaw(json.preamble || '');
    } catch (e) {
        builder.addRaw('');
    }
    return builder;
};

const validate = async (node: ExternalControlProgramNode, validationContext: ValidationContext): Promise<ValidationResponse> => {
    const api = new ProgramBehaviorAPI(self);
    const applicationNode = await api.applicationService.getApplicationNode('universal-robots-external-control-external-control-application') as ExternalControlApplicationNode;
    const port = applicationNode.port;
    const robotIP = applicationNode.robotIP;
    try {
        const json = await fetchBackendJson(port, robotIP, api);
        return { isValid: !!json.valid };
    } catch (e) {
        return { isValid: false };
    }
};

const allowChildInsert = (node: ProgramNode, childType: string): OptionalPromise<boolean> => true;

const allowedInsert = (insertionContext: InsertionContext): OptionalPromise<boolean> => true;

const nodeUpgrade = (loadedNode: ProgramNode): ProgramNode => loadedNode;

const behaviors: ProgramBehaviors = {
    programNodeLabel: createProgramNodeLabel,
    factory: createProgramNode,
    generateCodeBeforeChildren: generateScriptCodeBefore,
    generateCodeAfterChildren: generateScriptCodeAfter,
    generateCodePreamble: generatePreambleScriptCode,
    validator: validate,
    allowsChild: allowChildInsert,
    allowedInContext: allowedInsert,
    upgradeNode: nodeUpgrade
};

registerProgramBehavior(behaviors);
