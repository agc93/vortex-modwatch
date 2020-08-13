import { log, util, selectors } from "vortex-api";
import { IExtensionContext, IExtensionApi, IMod } from 'vortex-api/lib/types/api';
import { showcaseAPI } from "vortex-showcase-api";
import { ModWatchRenderer } from "./renderer";
import { ModWatchAction } from "./action";
import { isSupported, getOrderedPluginList, isShowcaseReady } from './util';
import { IModWatchModList } from './types';
import { getModName } from "vortex-ext-common";
import { uploadModList, requestCredentials } from './upload';

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
            // buildReport(context.api);
            context.api.ext.createShowcase([], 'Modwat.ch', 'Publish');
        }
    }, () => isSupported(context.api.getState()) && isShowcaseReady(context.api));
    return true;
}

async function buildReport(api: IExtensionApi) {
    var currentGame = selectors.activeGameId(api.getState())
    var orderedPlugins = getOrderedPluginList(api.getState(), true);
    var modList: IMod[] = api.ext.getEnabledMods(currentGame);
    var model: IModWatchModList = {
        plugins: orderedPlugins.map(pl => pl.name),
        modlist: modList.map(m => getModName(m)),
        game: currentGame
    };
    var userDetails = await requestCredentials(api);
    if (userDetails != null) {
        uploadModList(api, model, userDetails, (upload) => {
            log('info', 'upload completed', { status: upload })
            if (upload) {
                api.sendNotification({
                    type: 'success',
                    message: 'Report successfully uploaded!',
                    actions: [
                        {
                            title: 'View', action: () => {
                                util.opn(`https://modwat.ch/u/${userDetails.username}`);
                            }
                        }
                    ]
                })
            }
        }, () => {
            api.sendNotification({
                type: 'error',
                message: 'Failed to upload showcase to modwat.ch!',
            });
        })
    }
}



module.exports = {
    default: main,
};