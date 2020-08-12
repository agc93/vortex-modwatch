import { IState, IProfileMod, IMod } from "vortex-api/lib/types/api"
import { util, selectors } from "vortex-api";

type PluginList = { [key: string]: Plugin; }
type Plugin = {
    /**
     * name of the mod that installed this plugin
     * may be undefined if this plugin was not installed with Vortex
     *
     * @type {string}
     * @memberOf IPlugin
     */
    modName?: string;
    /**
     * specifies whether this is a "native" plugin, that is: One
     * where the load order is hard-coded into the game engine so
     * we have no influence on if/when it is loaded.
     *
     * @type {boolean}
     * @memberOf IPlugin
     */
    isNative: boolean;
  }

export function getPluginList(state: IState): PluginList {
    return util.getSafe(state.session, ['plugins', 'pluginList'], {});
}

export function isSupported(gameId: string): boolean;
export function isSupported(state: IState): boolean;
export function isSupported(test: string|IState) {
    var gameId: string;
    if (typeof test == "string") {
        gameId = test as string;
    } else {
        gameId = selectors.activeGameId(test as IState);
    }
    const _supportedGames: string[] = ['skyrim', 'skyrimse', 'fallout4'];
    return _supportedGames.some(g => g == gameId)
}

export function getOrderedPluginList(state: IState, includeNative: boolean = false): {name: string, plugin: Plugin}[] {
    var allPlugins = getPluginList(state);
    var loadOrder = util.getSafe<{[fileName:string]: {enabled: boolean, loadOrder: number}}>(state, ['loadOrder'], {});
    return Object.keys(allPlugins).filter(pl => {
        return (loadOrder[pl] != undefined && loadOrder[pl].enabled) || (includeNative && allPlugins[pl].isNative)
    }).sort((a, b) => {
        return loadOrder[a].loadOrder - loadOrder[b].loadOrder;
    }).map(p => {
        return {name: p, plugin: allPlugins[p]};
    });
}

