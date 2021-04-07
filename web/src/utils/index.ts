import moment from 'moment';
import { camelCase, get } from 'lodash';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

import { KeyValuePairs } from 'types';
import * as gql from 'gql';

export const unixYearRange = {
  start: new Date(moment().startOf('year').unix() * 1000),
  end: new Date(moment().startOf('year').add(3, 'months').unix() * 1000), // TODO: make 1 year
};

/**
 * Is value undefined or true?
 */
export const undefOrTrue = (val: boolean | undefined): boolean =>
  val === undefined || val;

/**
 * Get object value by key (shallow)
 */
export const getStartsWith = (obj: KeyValuePairs, str: string): KeyValuePairs =>
  Object.entries(obj).find(([k]) => k.startsWith(str))[1];

export const getFirstNonString = (obj: KeyValuePairs): KeyValuePairs =>
  Object.values(obj).find((v) => typeof v !== 'string');

/**
 * Case-insensitive look for document
 */
export const getDocument = (docName: string): DocumentNode => {
  const key = Object.keys(gql).find(
    (k) => docName.toLowerCase() === k.toLowerCase(),
  );
  return gql[key];
};

/**
 * Get gql query and entity based on document name
 * (e.g. getMeasures and measures from GetMeasuresQuery)
 */
export const getQueryAndEntity = (
  docName: string,
): { queryName: string; entityName: string } => {
  const queryName = get(
    (get(getDocument(docName) as KeyValuePairs, 'definitions') || []).find(
      (d) => d.operation === 'query',
    ),
    'name.value',
  );
  const entityName = camelCase(queryName.split('get')[1]);

  return { queryName, entityName };
};

/**
 * Get gql entity path on docName (e.g. getIndications.indications)
 */
export const getEntityPath = (docName: string): string => {
  const { queryName, entityName } = getQueryAndEntity(docName);
  return `${queryName}.${entityName}`;
};
