
export interface IModWatchModList {
    game: string;
    plugins: string[];
    modlist?: string[];
    ini?: string[];
    prefsini?: string[];
    enb?: string;
    tag?: string;
}

export interface IModWatchUser {
    username: string;
    password: string;
}

export type IModWatchProfile = IModWatchModList & IModWatchUser;
//the timestamp happens on the server-side, we don't need to use that apparently