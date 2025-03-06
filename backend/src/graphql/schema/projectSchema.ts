import { gql } from "apollo-server-express";

export const projectTypeDefs = gql`
  type Project {
    idProjet: String!
    nom_projet: String!
    description_projet: String
    date_debut_projet: Date
    date_fin_projet: Date
    statut_project: StatutProject!
    equipes: [Equipe!]!  # Many-to-many relationship with Equipe
  }

  type DeleteProjectResponse {
    success: Boolean!
    message: String
  }

  extend type Query {
    projects: [Project!]!
    project(id: String!): Project
  }

  extend type Mutation {
    createProject(
      nom_projet: String!
      description_projet: String
    ): Project
    updateProject(
      id: String!
      nom_projet: String
      description_projet: String
      statut_project: StatutProject
    ): Project
    deleteProject(id: String!): DeleteProjectResponse
  }
`;