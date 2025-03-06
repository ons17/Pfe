import sql from 'mssql';
import { projectResolvers } from './projectResolvers';

export const relationshipResolvers = {
  Mutation: {
    addEquipeToProject: async (
      _: any,
      { idProjet, idEquipe }: { idProjet: string; idEquipe: string },
      { pool }: { pool: sql.ConnectionPool }
    ) => {
      try {
        // Check if the relationship already exists
        const existingRelationship = await pool.request()
          .input('idProjet', sql.UniqueIdentifier, idProjet)
          .input('idEquipe', sql.UniqueIdentifier, idEquipe)
          .query(`
            SELECT idProjet, idEquipe
            FROM ProjectEquipe
            WHERE idProjet = @idProjet AND idEquipe = @idEquipe;
          `);
    
        if (existingRelationship.recordset.length > 0) {
          throw new Error("This Equipes is already associated with this project.");
        }
    
        // Insert the new relationship
        await pool.request()
          .input('idProjet', sql.UniqueIdentifier, idProjet)
          .input('idEquipe', sql.UniqueIdentifier, idEquipe)
          .query(`
            INSERT INTO ProjectEquipe (idProjet, idEquipe)
            VALUES (@idProjet, @idEquipe);
          `);
    
        return await projectResolvers.Query.project(_, { id: idProjet }, { pool });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error adding Equipes to project:", error.message);
          throw new Error("Error adding Equipes to project: " + error.message);
        } else {
          console.error("Error adding Equipes to project:", error);
          throw new Error("Error adding Equipes to project: " + error);
        }
      }
    },

    removeEquipeFromProject: async (
      _: any,
      { idProjet, idEquipe }: { idProjet: string; idEquipe: string },
      { pool }: { pool: sql.ConnectionPool }
    ) => {
      try {
        // Check if the relationship exists before attempting to delete
        const existingRelationship = await pool.request()
          .input('idProjet', sql.UniqueIdentifier, idProjet)
          .input('idEquipe', sql.UniqueIdentifier, idEquipe)
          .query(`
            SELECT idProjet, idEquipe
            FROM ProjectEquipe
            WHERE idProjet = @idProjet AND idEquipe = @idEquipe;
          `);
    
        if (existingRelationship.recordset.length === 0) {
          throw new Error("This Equipe is not associated with the project.");
        }
    
        // Delete the existing relationship
        await pool.request()
          .input('idProjet', sql.UniqueIdentifier, idProjet)
          .input('idEquipe', sql.UniqueIdentifier, idEquipe)
          .query(`
            DELETE FROM ProjectEquipe
            WHERE idProjet = @idProjet AND idEquipe = @idEquipe;
          `);
    
        return await projectResolvers.Query.project(_, { id: idProjet }, { pool });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error removing Equipe from project:", error.message);
          throw new Error("Error removing Equipe from project: " + error.message);
        } else {
          console.error("Error removing Equipe from project:", error);
          throw new Error("Error removing Equipe from project: " + error);
        }
      }
    },
  },    
};