import { IShowcaseRenderer, ModInfoDisplay, ITemplateModel } from "vortex-showcase-api";
import { IExtensionApi, IMod, IState } from "vortex-api/lib/types/api";
import { log, util, selectors } from "vortex-api";
import { getPluginList, getOrderedPluginList, isSupported, isInDLCGroup, isGamePlugin } from "./util";
import { IModWatchModList } from "./types";

export class ModWatchRenderer implements IShowcaseRenderer {
    // _supportedGames: string[] = ['skyrim', 'skyrimse', 'fallout4', 'fallout4vr', 'skyrimvr']
    

    createModel(api: IExtensionApi, mod: IMod): ModInfoDisplay|any {
        log('debug', 'invoking test renderer: createModel', {mod: mod.id});
        var pluginList = getPluginList(api.getState());
        var matchingPlugins = Object.keys(pluginList).filter(pl => {
            var modName = util.getSafe(pluginList[pl], ['modName'], undefined);
            return modName != undefined && modName == mod.id
        });
        if (matchingPlugins && matchingPlugins.length > 0) {
            return {meta: {plugins: matchingPlugins, id: mod.id}};
        }
        return null;
    }

    async createShowcase(api: IExtensionApi, model: ITemplateModel): Promise<string> {
        // var result: IDialogResult = await api.showDialog('question', 'Additional Information', )
        var state = api.getState();
        var currentGame = selectors.activeGameId(state);
        if (isSupported(currentGame)) {
            log('debug', 'building full plugin list');
            var orderedPlugins = getOrderedPluginList(state, true);
            var modIds = model.mods.map(m => m.meta.id);
            orderedPlugins = orderedPlugins.filter(pl => modIds.some(id => id == pl.plugin.modName) || isGamePlugin(state, pl));
            var output: IModWatchModList = {
                game: currentGame,
                plugins: orderedPlugins.map(pl => pl.name),
                modlist: model.mods.map(m => m.name),
                tag: `Vortex${model.title ? ' - ' + model.title : ''}`
            };
            return JSON.stringify(output, null, '\t');
        } else {
            log('warn', 'unsupported game!', {game: model.game});
            return Promise.reject('Unsupported game!');
        }
        // return Promise.resolve('somesuchtext');
    }

    isEnabled?(gameId: string): boolean {
        return isSupported(gameId);
    }
}

