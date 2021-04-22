import { ReactElement, useState } from 'react';
import { uniqBy } from 'lodash';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { Alert } from '@material-ui/core';

import ErrorBoundary from 'ErrorBoundary';
import { DataGrid, Table } from 'components/Table';
import { JSONObject } from 'types';
import { getFirstNonString, getQueryAndEntity, getStartsWith } from 'utils';
import {
  GetDataTypeDocument,
  GetDataTypesDocument,
  GetMeasureDocument,
  GetMeasuresDocument,
  UpsertMeasureDocument,
  DeleteMeasureDocument,
  GetIndicationDocument,
  GetIndicationsDocument,
  UpsertIndicationDocument,
  DeleteIndicationDocument,
} from 'gql';
import { Logger } from 'logger';
import Content from './Content';

const DocumentMap = {
  GetDataTypeDocument,
  GetDataTypesDocument,
  GetMeasureDocument,
  GetMeasuresDocument,
  UpsertMeasureDocument,
  DeleteMeasureDocument,
  GetIndicationDocument,
  GetIndicationsDocument,
  UpsertIndicationDocument,
  DeleteIndicationDocument,
};

// TODO: fix this cheesy mess.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrapData = (data): any => {
  try {
    return getFirstNonString(getFirstNonString(data));
  } catch (e) {
    Logger.warn(e);
  }
  return [];
};

const getReturnObj = (
  data: { [any: string]: { [any: string]: string | number } },
  str: string,
) => getFirstNonString(getStartsWith(data, str));

export interface ComponentProps {
  /**
   * Delete function
   */
  delete?: {
    document: string;
  };
  /**
   * Properties
   */
  props?: JSONObject;
  /**
   * Query function
   */
  read?: {
    document: string;
    parameters: JSONObject;
  };
  /**
   * Function to query for a single entity
   * (if read is a fetchMany)
   */
  readOne?: {
    document: string;
    parameters: JSONObject;
  };
  /**
   * Upsert function
   */
  upsert?: {
    document: string;
  };
  /**
   * Component types
   */
  type: 'CONTENT' | 'DATAGRID' | 'TABLE';
}

/**
 * A generic, metadata-driven component
 */
const Component = ({
  delete: del,
  props,
  read,
  readOne,
  upsert,
  type,
}: ComponentProps): ReactElement => {
  const { id } = useParams() as { id: string };
  const [error, setError] = useState(null);
  const { entityName, queryName } = getQueryAndEntity(read.document);

  const onError = (e) => {
    setError(e);
    Logger.error(e);
  };

  const { data } = useQuery(DocumentMap[read.document], {
    onError,
    variables: {
      input: {
        ...read.parameters,
        id: read.parameters.id ? Number(id) : undefined,
      },
    },
  });

  const [readOneFunc] = readOne
    ? useLazyQuery(DocumentMap[readOne.document])
    : [null];

  /**
   * Mutation with convoluted effort of adding to list if it doesn't already
   * exist.
   */
  const [mutate] = upsert
    ? useMutation(DocumentMap[upsert.document], {
        onError,
        update(cache, { data: d }) {
          cache.modify({
            fields: {
              [queryName](existing = { [entityName]: [] }) {
                return Array.isArray(existing[entityName])
                  ? {
                      [entityName]: uniqBy(
                        [
                          ...existing[entityName],
                          { __ref: cache.identify(getReturnObj(d, 'upsert')) },
                        ],
                        '__ref',
                      ),
                    }
                  : {
                      [entityName]: {
                        __ref: cache.identify(getReturnObj(d, 'upsert')),
                      },
                    };
              },
            },
          });
        },
      })
    : [undefined];

  /**
   * Delete mutation with cache eviction.
   */
  const [deleteMutation] = del
    ? useMutation(DocumentMap[del.document], {
        onError,
        update(cache, { data: d }) {
          cache.evict({
            id: cache.identify(getReturnObj(d, 'delete')),
          });
        },
      })
    : [undefined];

  if (!data) {
    return null;
  }

  let component = <span />;

  switch (type) {
    case 'CONTENT':
      component = (
        <Content
          {...props}
          data={unwrapData(data)}
          deleteMutation={deleteMutation}
          mutation={mutate}
        />
      );
      break;
    case 'DATAGRID':
      component = (
        <DataGrid
          {...props}
          deleteMutation={deleteMutation}
          mutation={mutate}
          rows={unwrapData(data)}
        />
      );
      break;
    case 'TABLE':
      component = (
        <Table
          {...props}
          deleteMutation={deleteMutation}
          mutation={mutate}
          readOne={readOneFunc}
          rows={unwrapData(data)}
        />
      );
      break;
    default:
      component = <span />;
  }

  return (
    <ErrorBoundary>
      {error && (
        <Alert onClose={() => setError(null)} severity="error" sx={{ mb: 1 }}>
          {error.message}
        </Alert>
      )}
      {component}
    </ErrorBoundary>
  );
};

export default Component;
