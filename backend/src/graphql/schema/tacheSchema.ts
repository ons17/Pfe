import { gql } from 'apollo-server-express';

export const tacheTypeDefs = gql`
  type Tache {
    id: ID!
    nom_tache: String!
    description_tache: String!
    date_debut_tache: String!
    date_fin_tache: String
    statut_tache: StatutTache!
    projet: Project!
  }

  enum StatutTache {
    TODO
    IN_PROGRESS
    END
  }

  type Query {
    taches: [Tache!]!
    tache(id: ID!): Tache
  }

  type Mutation {
    createTache(
    nom_tache: String!
    description_tache: String!
    date_debut_tache: String!
    dureeMax_Tache: Int!
    statut_tache: StatutTache!
    projetId: ID!
  ): Tache!
    
    updateTache(
      id: ID!
      nom_tache: String
      description_tache: String
      date_debut_tache: String
      date_fin_tache: String
      statut_tache: StatutTache
    ): Tache!
    
    deleteTache(id: ID!): Boolean
  }
`;
