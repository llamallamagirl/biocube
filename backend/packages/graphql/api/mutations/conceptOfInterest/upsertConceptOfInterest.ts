import { gql } from 'apollo-server-express';

const upsertConceptOfInterest = gql`
  mutation upsertConceptOfInterest($input: UpsertConceptOfInterestInput!) {
    upsertConceptOfInterest(input: $input) {
      conceptOfInterest {
        id
        aspectsOfHealth {
          id
          description
          name
          url
        }
        description
        measures {
          id
          description
          name
          url
        }
        name
      }
    }
  }
`;

export default upsertConceptOfInterest;
