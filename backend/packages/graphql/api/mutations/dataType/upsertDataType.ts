import { gql } from 'apollo-server-express';

const upsertDataType = gql`
  mutation upsertDataType($input: UpsertDataTypeInput!) {
    upsertDataType(input: $input) {
      dataType {
        id
        description
        name
      }
    }
  }
`;

export default upsertDataType;