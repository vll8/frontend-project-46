#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
    .name('gendiff')
    .description('Compares two configuration files and shows a difference.')
    .option('-V, --version', 'output the version number')

    program.parse();