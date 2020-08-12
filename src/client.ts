import retry from 'async-retry';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { log } from "vortex-api";
import { IModWatchProfile, IModWatchModList, IModWatchUser } from './types';

export class ModWatchClient {
    protected retryCount: number = 3;

    uploadModList = async (modList: IModWatchModList, user: IModWatchUser): Promise<boolean> => {
        var url = `https://api.modwat.ch/loadorder`
        var body: IModWatchProfile = {
            ...modList,
            ...user
        };
        try {
            var resp = await retry(async bail => {
                try {
                    var response = await axios.post(
                        url, 
                        body, 
                        {
                            headers: { 'User-Agent': 'Showcase/0.1.0' }
                        });
                    return response.status;
                } catch (err) {
                    if ((err as AxiosError).response && (err as AxiosError).response.status == 401) {
                        bail(new AuthError('Authentication failed!'));
                    } else {
                        throw (err);
                    }
                }
            }, {retries: 2});
            log('info', 'upload completed', {status: resp});
            return resp == 201;
        }  catch (err) {
            throw(err);
        }
    }
    uploadRaw = async (game: string, user: {username: string, password: string}, data: {mods: string[], plugins?: string[]}, enb?: string, tag?: string): Promise<boolean|void> => {
        var body: IModWatchProfile = {
            game,
            username: user.username,
            password: user.password,
            plugins: data.plugins,
            modlist: data.mods,
            enb: enb,
            tag: tag
        };
        return this.uploadModList(body, body);
    }
}

class AuthError extends Error {
    constructor(...params) {
      super(...params);
      this.name = 'AuthError';

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AuthError)
      }
    }
  }