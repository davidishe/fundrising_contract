import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/example_jetton_transfer.tact',
    options: {
        debug: true,
    },
};
