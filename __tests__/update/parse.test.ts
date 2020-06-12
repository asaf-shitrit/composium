import parse from '../../src/update/parse';
import fs from 'fs'
import _ from 'lodash'

describe('testing parse.ts file', () => {
    describe('parseOutNeededVersionFileParams function', () => {
        it('should return all needed params in a version file', () => {
            const expectedVars = ['port', 'name']
            const fileContent = fs.readFileSync('./__tests__/file-example.yaml').toString()
            const neededVars = parse.parseOutNeededVersionFileParams(fileContent)
            expect(_.intersection(expectedVars, neededVars).length).toBe(0)
        })
    })
    describe('parseOutEnvFile function', () => {
        it('should return all the env params from an env file', () => {
            const expectedEnvFile = {
                'install-dir': '/etc/cyolo-idac',
                'upstream': 'tcp.cyolo.io:443',
                'upstream-sni': 'tcp.cyolo.io'
            }
            const fileContent = fs.readFileSync('./__tests__/good-env-file').toString()
            const parsedEnvFile = parse.parseOutEnvFile(fileContent)
            expect(parsedEnvFile).toStrictEqual(expectedEnvFile)
        })
    })  
})