import version, { IVersion, VersionsFile } from '../src/version';
import axios from 'axios'
import fs from 'fs'

const ValidVersionsFileContent = {
    "test": [{
        "hash": "04deec17258797442923860f2c501a2e",
        "version": "1.0.0",
        "url": "http://localhost:8080/file1.txt"
    },{
        "hash": "a6a7930bb7eaec5b3f368e37422c4c61",
        "version": "1.1.0",
        "url": "http://localhost:8080/file2.txt"
    },{
        "hash": "gggg930bb7eaec5b3f368e37422c4c61",
        "version": "2.0.0",
        "url": "http://localhost:8080/file3.txt"
    }]
}

const InValidVersionsFileContent = {
    "test": [{
        "version": "1.0.0",
        "url": "http://localhost:8080/file1.txt"
    },{
        "hash": "a6a7930bb7eaec5b3f368e37422c4c61",
        "version": "1.1.0",
    }]
}

describe('testing version.ts file', () => {
    describe('getVersionsFile function', () => {

        const testUrl = "http://test-url.com"
        const testAppId = "test"

        it('should be able to parse a valid versions file', async () => {
            const mockedGetFn = jest.fn()
            mockedGetFn.mockReturnValue(Promise.resolve({
                data: ValidVersionsFileContent
            }))

            axios.get = mockedGetFn
            
            const { appVersions } = await version.getVersionsFile(testAppId, testUrl)
            expect(appVersions).toStrictEqual(ValidVersionsFileContent[testAppId])
            expect(mockedGetFn).toBeCalled()
            expect(mockedGetFn).toBeCalledWith(testUrl)
        })
        it('should throw an error on an invalid versions file', async () => {
            const mockedGetFn = jest.fn()
            mockedGetFn.mockReturnValue(Promise.resolve({
                data: InValidVersionsFileContent
            }))

            axios.get = mockedGetFn

            await expect(version.getVersionsFile(testAppId, testUrl)).rejects.toThrow()
            expect(mockedGetFn).toBeCalled()
            expect(mockedGetFn).toBeCalledWith(testUrl)
        })
    })
    describe('VersionsFile class', () => {
        const versionFile = new VersionsFile(ValidVersionsFileContent.test)
        describe('getVersionByFileHash function', () => {
            it('should be able to return a file version by its hash', () => {
                const versionIndex = 0
                const versionHash = versionFile.appVersions[versionIndex].hash
                expect(versionFile.getVersionByFileHash(versionHash)).toStrictEqual(versionFile.appVersions[versionIndex])
            })
            it('should return undefined on a unknown file version hash', () => {
                expect(versionFile.getVersionByFileHash('not-a-hash')).toBeUndefined()
            })
        })
        describe('getLatestVersion function', () => {
            it('should return the latest version in the version file if no params were given', () => {
                expect(versionFile.getLatestVersion().version).toBe('2.0.0')
            })
            it('should return the latest version in the currant major version if a version with the lower major version is given', () => {
                const lowerMajorVersion : IVersion = {
                    "hash": "04deec17258797442923860f2c501a2e",
                    "version": "1.0.0",
                    "url": "http://localhost:8080/file1.txt"
                }
                expect(versionFile.getLatestVersion(lowerMajorVersion, false).version).toBe('1.1.0')
            })
            it('should return the currant version if we are the latest version', () => {
                const latestVersion : IVersion = {
                    "hash": "gggg930bb7eaec5b3f368e37422c4c61",
                    "version": "2.0.0",
                    "url": "http://localhost:8080/file3.txt"
                }
                expect(versionFile.getLatestVersion(latestVersion, false)).toStrictEqual(latestVersion)
            })
        })

        describe('isThereNewUpdate function', () => {
            it('should return there is a new update if the currant one is of lower version and major updates are allowed', () => {
                const lowerMajorVersion : IVersion = {
                    "hash": "04deec17258797442923860f2c501a2e",
                    "version": "1.0.0",
                    "url": "http://localhost:8080/file1.txt"
                }
                expect(versionFile.isThereNewUpdate(lowerMajorVersion, false)).toBeTruthy()
                expect(versionFile.isThereNewUpdate(lowerMajorVersion, true)).toBeTruthy()
            })
            it('should return there isnt a new update if the currant version is the latest in this major version series', () => {
                const lowerMajorVersion : IVersion = {
                    "hash": "a6a7930bb7eaec5b3f368e37422c4c61",
                    "version": "1.1.0",
                    "url": "http://localhost:8080/file2.txt"
                }
                expect(versionFile.isThereNewUpdate(lowerMajorVersion, false)).toBeFalsy()
                expect(versionFile.isThereNewUpdate(lowerMajorVersion, true)).toBeTruthy()
            })
            it('should return there isnt a new update if the currant version is the latest one', () => {
                const latestVersion : IVersion = {
                    "hash": "gggg930bb7eaec5b3f368e37422c4c61",
                    "version": "2.0.0",
                    "url": "http://localhost:8080/file3.txt"
                }
                expect(versionFile.isThereNewUpdate(latestVersion, false)).toBeFalsy()
                expect(versionFile.isThereNewUpdate(latestVersion, true)).toBeFalsy()
            })
        })
        
    })
})