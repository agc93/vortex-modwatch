import { IShowcaseAction } from "vortex-showcase-api";
import { IExtensionApi } from "vortex-api/lib/types/api";
import { log, util, selectors } from "vortex-api";
import { IModWatchModList, IModWatchUser } from "./types";
import { ModWatchClient } from "./client";
import { uploadModList, requestCredentials } from "./upload";

export class ModWatchAction implements IShowcaseAction {
    private _api: IExtensionApi;
    private _client: ModWatchClient;
    /**
     *
     */
    constructor(api: IExtensionApi) {
        this._api = api;
        this._client = new ModWatchClient();
    }
    runAction = async (renderer: string, output: string): Promise<void> => {
        var userDetails = await requestCredentials(this._api);
        if (userDetails == null) {
            return null;
        } else {
            var modList: IModWatchModList = JSON.parse(output);
            this._api.sendNotification({
                type: 'info',
                progress: 0,
                message: 'Uploading...',
                id: 'mw-upload-progress'
            });
            try {
                uploadModList(this._api, modList, userDetails, (upload) => {
                    log('info', 'upload completed', {status: upload})
                    if (upload) {
                        this._api.sendNotification({
                            type: 'success',
                            message: 'Showcase successfully uploaded!',
                            actions: [
                                {
                                    title: 'View', action: (dismiss) => {
                                        util.opn(`https://modwat.ch/u/${userDetails.username}`);
                                    }
                                }
                            ]
                        })
                    } else {
                        this._api.showErrorNotification('Failed to upload to modwat.ch!', null, {allowReport: false});
                    }
                }, (err) => {
                    this._api.sendNotification({
                        type: 'error',
                        message: 'Failed to upload showcase to modwat.ch!',
                    });
                }, this._client)
            } catch (err) {
                //this shouldn't be possible realistically
            } finally {
                this._api.dismissNotification('mw-upload-progress');
            }
        }
    }

    isEnabled?(renderer: string): boolean {
        return renderer == 'Modwat.ch'
    }

}