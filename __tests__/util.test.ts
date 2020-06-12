import util from '../src/util';

describe('testing util file', () => {
    describe('getFolderPath func', () => {
        it('should return folder path for abs path', () => {
            expect(util.getFolderPath('/etc/test/file.txt')).toBe('/etc/test')
        })
        it('should return folder path for reletive path', () => {
            expect(util.getFolderPath('./etc/test/file.txt')).toBe('./etc/test')
        })
        it('should return folder path for .', () => {
            expect(util.getFolderPath('.')).toBe('.')
        })
    })
    describe('getFileNameFromPath func', () => {
        it('should return file name in abs path', () => {
            expect(util.getFileNameFromPath('/etc/test/file.txt')).toBe('file.txt')
        })
        it('should return file name for actual file name', () => {
            expect(util.getFileNameFromPath('file.txt')).toBe('file.txt')
        })
    })
    describe('createBashFilePath func', () => {
        it('should return a valid base file path from a version file path', () => {
            expect(util.createBaseFilePath('/etc/version.txt')).toBe('/etc/version.base.txt')
        })
    })
})
