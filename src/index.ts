import { log } from "vortex-api";
import { IExtensionContext } from 'vortex-api/lib/types/api';
import { showcaseAPI } from "vortex-showcase-api";
import { ModWatchRenderer } from "./renderer";
import { ModWatchAction } from "./action";
import { isSupported, isShowcaseReady } from './util';

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    context.requireExtension('Vortex Showcase');
    context.once(() => {
        if (isShowcaseReady(context.api)) {
            (context.api.ext as showcaseAPI).addShowcaseAction('Publish', () => new ModWatchAction(context.api));
            (context.api.ext as showcaseAPI).addShowcaseRenderer('Modwat.ch', () => new ModWatchRenderer());
        } else {
            log('warn', 'Showcase API not found! Modwatch support not installed');
        }
    });
    context.registerAction('mod-icons', 101, 'profile', {}, 'Upload to modwat.ch', () => {
        if (isSupported(context.api.getState())) {
            (context.api.ext as showcaseAPI).createShowcase([], 'Modwat.ch', 'Publish');
        }
    }, () => isSupported(context.api.getState()) && isShowcaseReady(context.api));
    return true;
}

module.exports = {
    default: main,
};