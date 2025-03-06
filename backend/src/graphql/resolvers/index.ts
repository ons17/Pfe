import { projectResolvers } from "./projectResolvers";
import { equipeResolvers } from "./equipeResolvers";
import { relationshipResolvers } from "./relationshipResolvers";
import { tacheResolvers } from "./tacheResolvers";


export const resolvers = {
  Query: {
    ...projectResolvers.Query,
    ...equipeResolvers.Query,
    ...tacheResolvers.Query,
  },
  Mutation: {
    ...projectResolvers.Mutation,
    ...equipeResolvers.Mutation,
    ...relationshipResolvers.Mutation,
    ...tacheResolvers.Mutation,
  },
};