import { IExtensionApi, IDialogResult } from "vortex-api/lib/types/api";
import { IModWatchModList, IModWatchUser } from "./types";
import { ModWatchClient } from "./client";
import { log, util } from "vortex-api";

export async function requestCredentials(api: IExtensionApi): Promise<IModWatchUser | null> {
    var nexusUser = util.getSafe(api.getState().persistent, ['nexus', 'userInfo', 'name'], '');
    var result: IDialogResult = await api.showDialog('question', 'Modwat.ch User Details', {
        text: "Please enter your modwat.ch username and password below.\n\nYour details will not be saved and will only be used to upload your report.",
        input: [
            {id: 'username', label: 'Username', type: 'text', value: nexusUser},
            {id: 'password', label: 'Password', type: "password"}
        ]
    }, [
        {label: "Continue", default: true},
        {label: "Cancel"}
    ]);
    if (result.action == "Cancel") {
        return null;
    } else {
        var userDetails: IModWatchUser = {password: result.input.password, username: result.input.username};
        return userDetails;
    }
}

export async function uploadModList(api: IExtensionApi, modList: IModWatchModList, user: IModWatchUser, onUpload: (success: boolean) => void, onError?: (err?: Error) => void, client?: ModWatchClient) {
    client = client ?? new ModWatchClient();
    api.sendNotification({
        type: 'info',
        progress: 0,
        message: 'Uploading...',
        id: 'mw-upload-progress'
    });
    try {
        var upload = await client.uploadModList(modList, user);
        log('info', 'upload completed', {status: upload})
        if (upload) {
            onUpload(upload);
        } else {
            api.showErrorNotification('Failed to upload to modwat.ch!', null, {allowReport: false});
        }
    } catch (err) {
        log('error', 'error while uploading to modwat.ch', {err});
        if (err.name && err.name == 'AuthError') {
            api.sendNotification({
                type: 'error',
                title: 'Failed to authenticate to modwat.ch',
                message: 'You may have entered the wrong password, or the username is taken'
            });
        } else {
            if (onError) {
                onError(err)
            } else {
                throw(err)
            }
        }
    } finally {
        api.dismissNotification('mw-upload-progress');
    }
}