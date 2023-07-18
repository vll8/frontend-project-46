import _ from 'lodash';
import path from 'node:path';
import fs from 'fs';

const getDifference = (data1, data2) => {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  const keys = _.sortBy(_.union(keys1, keys2));

  const result = keys.map((key) => {
    if (!_.has(data1, key)) {
      return [key, { type: 'added', value: data2[key] }];
    }
    if (!_.has(data2, key)) {
      return [key, { type: 'deleted', value: data1[key] }];
    }
    if (_.isPlainObject(data1[key]) && _.isPlainObject(data2[key])) {
      return [key, { type: 'nested', children: getDifference(data1[key], data2[key]) }];
    }
    if (data1[key] !== data2[key]) {
      return [key, { type: 'changed', value1: data1[key], value2: data2[key] }];
    }
    return [key, { type: 'unchanged', value: data1[key] }];
  });
  return _.fromPairs(result);
};

const replacer = ' ';
const spacesCount = 4;
const getIndent = (depth) => replacer.repeat(depth * spacesCount - 2);

const signs = {
  added: '+ ',
  deleted: '- ',
  unchanged: '  ',
};

const func = (data) => {
  const iter = (curentValue, depth) => {
    if (!_.isPlainObject(curentValue)) {
      return `${curentValue}`;
    }
    const bracketIndent = replacer.repeat((depth - 1) * spacesCount);
    const lines = Object
      .entries(curentValue)
      .map(([key, val]) => {
        switch (val.type) {
          case 'added':
          case 'deleted':
          case 'unchanged':
            return `${getIndent(depth)}${signs[val.type]}${key}: ${iter(val.value, depth + 1)}`;
          case 'changed':
            return `${getIndent(depth)}- ${key}: ${iter(val.value1, depth + 1)}\n${getIndent(depth)}+ ${key}: ${iter(val.value2, depth + 1)}`;
          case 'nested':
            return `${getIndent(depth)}  ${key}: ${iter(val.children, depth + 1)}`;
          default:
            return `${getIndent(depth)}  ${key}: ${iter(val.value || val, depth + 1)}`;
        }
      });
    return [
      '{',
      ...lines,
      `${bracketIndent}}`,
    ].join('\n');
  };
  return iter(data, 1);
};

const parseJsonFile = (file1, file2) => {
  const readDataFile1 = fs.readFileSync(path.resolve(process.cwd(), file1), 'utf-8');
  const readDataFile2 = fs.readFileSync(path.resolve(process.cwd(), file2), 'utf-8');

  const parseObjFile1 = JSON.parse(readDataFile1);
  const parseObjFile2 = JSON.parse(readDataFile2);

  const result = getDifference(parseObjFile1, parseObjFile2);
  return func(result);
};

export default parseJsonFile;
