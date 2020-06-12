import scheme from '../../src/update/scheme'
import fs from 'fs'

describe('testing scheme.ts file', () => {
    describe('validateEnvFile function', () => {
        it('should be able to determine if an env file is valid', () => {
            const fileContent = fs.readFileSync('./__tests__/good-env-file').toString()
            expect(scheme.validateEnvFile(fileContent)).toBeTruthy()
        })
        it('should be able to determine if an env file is invalid', () => {
            const fileContent = fs.readFileSync('./__tests__/bad-env-file').toString()
            expect(scheme.validateEnvFile(fileContent)).toBeFalsy()
        })
    })
})