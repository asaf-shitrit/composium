import axios from 'axios';
import Joi from '@hapi/joi';
import _ from 'lodash';
import semver from 'semver';

type TVersionString = string

export interface IVersion {
    hash: string;
    version: TVersionString;
    url: string;
}

interface IVersionData {
    [appId: string] : IVersion[]
}

const getMajorVersion = (version: IVersion) => Number(version.version.split('.')[0])

export class VersionsFile {
    
    appVersions: IVersion[]

    constructor(versions: IVersion[]){
        this.appVersions = versions
    }

    getVersionByFileHash(hash: string) : IVersion | undefined {
        return this.appVersions.find(versionData => versionData.hash === hash);
    }

    getLatestVersion(currantVersion?: IVersion, allowMajorUpdate: boolean = true){
        let sortedVersions = this.appVersions.sort((ver1, ver2) => {
            if(semver.eq(ver1.version, ver2.version)){
                return 0;
            }

            if(semver.gt(ver1.version, ver2.version)){
                return 1;
            } else {
                return -1;
            }
        }).reverse()

        // if a currant version was given and major updates are not allowed
        // filter versions to include only minor updates
        if(currantVersion && !allowMajorUpdate){
            sortedVersions = sortedVersions.filter(ver => getMajorVersion(ver) === getMajorVersion(currantVersion))
        }

        return sortedVersions[0]
    }

    isThereNewUpdate(currantVersion: IVersion, allowMajorUpdate: boolean) : boolean {
        return this.getLatestVersion(currantVersion, allowMajorUpdate).hash !== currantVersion.hash
    }
}

const VersionDataArrayScheme = Joi.array().items({
    hash: Joi.string().required(),
    version: Joi.string().regex(/(\d+\.?){3}/).required(),
    url: Joi.string().required()
})

const getVersionsFile = async (appId: string, versionsUrl: string) : Promise<VersionsFile> => {
    const { data } = await axios.get<IVersionData>(versionsUrl);

    const { error, value } = VersionDataArrayScheme.validate(data[appId])

    if(error){
        throw error;
    }

    return new VersionsFile(value);
}

export default {
    getVersionsFile
}


