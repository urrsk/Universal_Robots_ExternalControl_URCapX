import { ProgramNode } from '@universal-robots/contribution-api';

export interface ExternalControlProgramNode extends ProgramNode {
    type: 'universal-robots-external-control-external-control-program';
    parameters: {
        port: number;
        robotIP: string;
    };
    lockChildren?: boolean;
    allowsChildren?: boolean;
}
