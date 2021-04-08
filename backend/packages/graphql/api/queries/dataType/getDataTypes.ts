import { gql } from 'apollo-server-express';

const getDataTypes = gql`
  query getDataTypes($input: GetDataTypesInput!) {
    getDataTypes(input: $input) {
      dataTypes {
        id
        description
        name
      }
    }
  }
`;

export default getDataTypes;