import { gql } from "apollo-server-express";

export const equipeTypeDefs = gql`
  type Equipe {
    idEquipe: String!
    nom_equipe: String!
    description_equipe: String
    projets: [Project]  # Many-to-many relationship with Project
  }

  type DeleteEquipeResponse {
    success: Boolean!
    message: String
  }

  extend type Query {
    equipes: [Equipe!]!
    equipe(id: String!): Equipe
  }

  extend type Mutation {
    createEquipe(
      nom_equipe: String!
      description_equipe: String
    ): Equipe
    updateEquipe(
      id: String!
      nom_equipe: String
      description_equipe: String
    ): Equipe
    deleteEquipe(id: String!): DeleteEquipeResponse
  }
`;