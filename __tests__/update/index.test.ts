import index, { UpdateDesc } from '../../src/update/index'
import fs from 'fs'
import axios from 'axios';
import { IVersion } from '../../src/version';

describe('index.ts file', () => {
    describe('performUpdate function', () => {
        it('should perform a file update successfully', async () => {
            const fileContent = fs.readFileSync('./__tests__/no-params-file-example.yaml').toString()

            const mockGetFn = jest.fn();
            mockGetFn.mockReturnValue(Promise.resolve({ data: fileContent }))
            axios.get = mockGetFn

            const mockPromisifiedWriteFileFn = jest.fn()
            mockPromisifiedWriteFileFn.mockReturnValue(Promise.resolve())
            fs.promises.writeFile = mockPromisifiedWriteFileFn

            const mockUnlinkFn = jest.fn()
            fs.promises.unlink = mockUnlinkFn

            const testUrl = "http://test-url"
            const testFilePath = "/test/test-file"
            const version : IVersion = { hash: "", version: "",  url: testUrl}
            const updateDesc = new UpdateDesc(version, testFilePath)
            await index.performUpdate(updateDesc)

            expect(mockGetFn).toBeCalled()
            expect(mockGetFn).toBeCalledTimes(1)
            expect(mockGetFn).toBeCalledWith(...[testUrl])

            expect(mockPromisifiedWriteFileFn).toBeCalled();
            expect(mockPromisifiedWriteFileFn).toBeCalledTimes(1);
            expect(mockPromisifiedWriteFileFn).toBeCalledWith(...[testFilePath, fileContent]);
        })
        // it('should handle an invalid url update path', async () => {
        //     const testUrl = "http://test-url"
        //     const testFilePath = "/test/test-file"
        //     const version : IVersion = { hash: "", version: "",  url: testUrl}
        //     const updateDesc = new UpdateDesc(version, testFilePath)

        //     await expect(index.performUpdate(updateDesc)).rejects.toThrow()
        // })
    })  
})