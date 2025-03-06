import { gql } from "apollo-server-express";
import { projectTypeDefs } from "./projectSchema";
import { equipeTypeDefs } from "./equipeSchema";
import { relationshipTypeDefs } from "./relationshipSchema";
import { tacheTypeDefs } from "./tacheSchema";


export const typeDefs = gql`
  scalar Date

  enum StatutProject {
    TODO
    IN_PROGRESS
    END
  }

  # Define the Query type
  type Query {
    _empty: String  # Placeholder field (required if Query is empty)
  }

  # Define the Mutation type
  type Mutation {
    _empty: String  # Placeholder field (required if Mutation is empty)
  }

  ${projectTypeDefs}
  ${equipeTypeDefs}
  ${relationshipTypeDefs}
  ${tacheTypeDefs}
`;