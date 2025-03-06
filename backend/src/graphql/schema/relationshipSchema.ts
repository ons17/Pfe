import { gql } from "apollo-server-express";

export const relationshipTypeDefs = gql`
  extend type Mutation {
    addEquipeToProject(
      idProjet: String!
      idEquipe: String!
    ): Project
    removeEquipeFromProject(
      idProjet: String!
      idEquipe: String!
    ): Project
  }
`;