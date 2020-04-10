'use strict';
const fs = require('fs');
const jsonEdit = require('@json-edit/json-edit');

class ServerlessPlugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;

        this.commands = {
            replaceHeaders: {
                usage: 'JSON input of key value pairs to find and replace',
                lifecycleEvents: ['replaceHeaders'],
                options: {
                    headers: {
                        usage:
                            'Specify the json object of key value pairs' +
                            '(e.g. "--headers \'{"a":"b"}\'" or "-s \'{"a":"b"}\'")',
                        required: true,
                        shortcut: 'h',
                    },
                    package: {
                        usage:
                            'Specify the package path. Default value is root directory .serverless' +
                            '(e.g. "--package \'.serverless\'" or "-p \'.serverless\'")',
                        required: false,
                        shortcut: 'p',
                    },
                },
            },
            deleteHeaders: {
                usage: 'Comma separated headers to remove',
                lifecycleEvents: ['deleteHeaders'],
                options: {
                    headers: {
                        usage:
                            'Comma separated headers to remove' +
                            '(e.g. "--headers \'header1,header2\'" or "-s \'header1,header2\'")',
                        required: true,
                        shortcut: 'h',
                    },
                    package: {
                        usage:
                            'Specify the package path. Default value is root directory .serverless' +
                            '(e.g. "--package \'.serverless\'" or "-p \'.serverless\'")',
                        required: false,
                        shortcut: 'p',
                    },
                },
            },
        };

        this.hooks = {
            'replaceHeaders:replaceHeaders': this.replaceHeaders.bind(this),
            'deleteHeaders:deleteHeaders': this.deleteHeaders.bind(this)
        };
    }

    async replaceHeaders() {
        this.serverless.cli.log('Running replaceHeaders');

        const servicePath = this.serverless.config.servicePath;
        let serverLessDirPath = servicePath + '/' + '.serverless';

        //Overwrite the default serverless directory path
        if (this.options.package) {
            serverLessDirPath = this.options.package;
        }

        //read all cloud formation json files
        const fileList = await this.readAllJSONFiles(serverLessDirPath);

        this.options.headers = JSON.parse(this.options.headers);

        this.serverless.cli.log(`headers : ${JSON.stringify(this.options.headers)}`);

        //iterate over all file to replace
        for (let i = 0; i < fileList.length; i++) {
            const data = fs.readFileSync(fileList[i], 'utf8');
            const json = JSON.parse(data);

            this.serverless.cli.log('----------------------------');
            this.serverless.cli.log(`File : ${fileList[i]}`);
            this.serverless.cli.log('Replacing Headers..........');
            const headerKeys = Object.keys(this.options.headers);
            for (let j = 0; j < headerKeys.length; j++) {
                const header = headerKeys[j];
                await jsonEdit.replaceValue(json, header, this.options.headers[header]);
                this.serverless.cli.log(header + '....Done')
            }

            //write json to file
            fs.writeFileSync(fileList[i], JSON.stringify(json, null, 2));
        }

        this.serverless.cli.log('----------------------------');
        this.serverless.cli.log('Completed replaceHeaders');
    }


    async deleteHeaders() {
        this.serverless.cli.log('Running deleteHeaders');

        const servicePath = this.serverless.config.servicePath;
        let serverLessDirPath = servicePath + '/' + '.serverless';

        //Overwrite the default serverless directory path
        if (this.options.package) {
            serverLessDirPath = this.options.package;
        }

        //read all cloud formation json files
        const fileList = await this.readAllJSONFiles(serverLessDirPath);

        const keysToDelete = this.options.headers.split(',');

        //iterate over all file to replace
        for (let i = 0; i < fileList.length; i++) {
            const data = fs.readFileSync(fileList[i], 'utf8');
            const json = JSON.parse(data);

            this.serverless.cli.log('----------------------------');
            this.serverless.cli.log(`File : ${fileList[i]}`);
            this.serverless.cli.log('Deleting Keys..........');
            for (let j = 0; j < keysToDelete.length; j++) {
                const header = keysToDelete[j];
                await jsonEdit.deleteNode(json, header);
                this.serverless.cli.log(header + '....Done')
            }

            //write json to file
            fs.writeFileSync(fileList[i], JSON.stringify(json, null, 2));
        }

        this.serverless.cli.log('----------------------------');
        this.serverless.cli.log('Completed deleteHeaders');
    }

    async readAllJSONFiles(directoryPath) {
        return new Promise(function (resolve, reject) {
            const fileList = [];
            fs.readdir(directoryPath, function (err, files) {
                if (err) {
                    this.serverless.cli.log('Unable to scan directory: ' + err);
                } else {
                    files.forEach(function (file) {
                        if (file.endsWith('.json'))
                            fileList.push(directoryPath + '/' + file)
                    });
                }
                resolve(fileList);
            });
        })
    }
}

module.exports = ServerlessPlugin;
