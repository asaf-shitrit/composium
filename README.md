# Composium 🛠

![Tests](https://github.com/asaf-shitrit/composium/workflows/Tests/badge.svg)

- [Composium 🛠](#composium-)
  - [Intro](#intro)
  - [Env Params](#env-params)
    - [INTERVAL](#interval)
    - [FILE_PATH](#file_path)
    - [VERSIONS_URL](#versions_url)
    - [APP_ID](#app_id)
    - [ALLOW_MAJOR_UPDATE](#allow_major_update)
    - [UPDATE_TO_LATEST_ON_NON_EXISTANT](#update_to_latest_on_non_existant)
    - [POST_UPDATE_VALIDATION_COMMAND](#post_update_validation_command)
    - [POST_UPDATE_COMMAND](#post_update_command)
    - [RUN_ONCE](#run_once)
    - [NO_UPDATE](#no_update)
  - [Usage](#usage)
  - [Docker](#docker)
  - [Versions File](#versions-file)
    - [Example](#example)
  - [Local Env Args](#local-env-args)
    - [Example](#example-1)
  - [Exit Codes](#exit-codes)
  - [Background](#background)

## Intro

Composium is a simple version manager for files that allows you to monitor version changes for a file and update it accordingly.

## Env Params

### INTERVAL

the actual inteval in miliseconds that the version file is polled for changes

### FILE_PATH

the versioned file path, if no file exists at the path the latest version will be downloaded.

### VERSIONS_URL

the version file publicly accessable url

### APP_ID

the version file app id defined

### ALLOW_MAJOR_UPDATE

allows/disallow composium to update files to new major versions.
this allows you to micromanage how to handle new version releases for files and prevent breaking changes from killing working production apps.

### UPDATE_TO_LATEST_ON_NON_EXISTANT

allow/disallow composium to update a file to latest if it doesn't exist at its given path

### POST_UPDATE_VALIDATION_COMMAND

a command to run after a new version is downloaded but before the post update command,
if this command returns an error the update is failed and rolledback to past version

### POST_UPDATE_COMMAND

a command to run after a successfull update.
this allows you to execute generic commands to your liking after any update you release

### RUN_ONCE

allows running of composium in one off mode instead of in a recurring schedule

### NO_UPDATE

allows running of composium without performing any active updates.
useful for checking if any updates are available through the stdout of the service.

## Usage

1. Create a versions file (an example is in the examples folder) and host it in some publicly accessable place.
2. Define any specific env you want to use at the server level in the .composium-env file
3. Start composium either as a standalone Node.JS project or with Docker (recomendded).

## Docker

There is a docker image of composium at `cyolsoec/composium`

## Versions File

The versions file is the single source of truth regarding all the existing file versions.
It defines the actual versions of the file (semantic version system) and where composium can download it from.
The file itself is a regular JSON format file, which holds at the top level keys which are the _app ids_ which map to each file versioned by composium,
this in turn allows you to host multiple file versions withing a single file for multiple composium isntances to work with.

### Example

```
{
    "test": [{
        "hash": "00aadfdfe66448e2b7a4e4c024caa0df",
        "version": "1.0.0",
        "url": "http://localhost:8080/docker-compose-1.yml"
    }, {
        "hash": "98f0c85487567ed9f510bbc9b0af5ef4",
        "version": "1.1.0",
        "url": "http://localhost:8080/docker-compose-2.yml"
    },{
        "hash": "44d0c5f38a048d290fd35318be2bec98",
        "version": "1.2.0",
        "url": "http://localhost:8080/docker-compose-3.yml"
    }]
}
```

## Local Env Args

If you need to specify certain arguments specific to some server that you want to be used at runtime, you can achive that by creating a **.composium-env** file in the versioned file folder.
Composium will then replace all occurances of <\*> inside a downloaded file with the arguments you supplied.

### Example

```
TEST_ARG=8000
TEST_ARG2=HELLO
```

## Exit Codes

To allow easier integration with one off update runs of composium and allow apps to identify if a new version has been identified the service will perform exits with certain exit codes to indicate its run results.

- 1 - General Error
- 80 - New Update
- 81 - No New Update
- 82 - Performed Rollback on Invalid Version

## Background

This service was developed as part of my work in [Cyolo](https://cyolo.io) as a means to perform recurring updates on compose file based deployments.
Please feel free to support us and read about our awesome security solutions in our [site](https://cyolo.io)
