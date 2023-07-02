#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
    .name('gendiff')
    .description('Compares two configuration files and shows a difference.')
    .option('-V, --version', 'output the version number')
    .argument('<filepath1>', 'first file')
    .argument('<filepath2>', 'second file')
    .option('-f, --format <type>', 'output format')
    

    program.parse();