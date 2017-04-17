# Making the secondary documents

"make.sh" can be run on a Linux computer to run the following command:

    node node_modules/process_code_defining_document/index.js SDA.md

That command should work on a windows computer with node installed. Testing to be done; bat file to be created.

## Process code defining document

[process_code_defining_document](https://github.com/kshowalter/process_code_defining_document) is a node module used to proccess a Markdown file, extract the Javascript code, and create the official pdf files. It is a command line interface application, run with the above command.
