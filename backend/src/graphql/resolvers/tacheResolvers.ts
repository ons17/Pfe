import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

export const tacheResolvers = {
  Query: {
    taches: async (_: any, __: any, { pool }: { pool: sql.ConnectionPool }) => {
      try {
        const result = await pool.request().query(`
          SELECT idTache, nom_tache, description_tache, date_debut_tache, date_fin_tache, idProjet, statut_tache
          FROM Taches;
        `);
        return result.recordset;
      } catch (error) {
        console.error("Error fetching taches:", error);
        throw new Error("Error fetching taches");
      }
    },

    tache: async (_: any, { id }: { id: string }, { pool }: { pool: sql.ConnectionPool }) => {
      try {
        const result = await pool.request()
          .input("id", sql.UniqueIdentifier, id)
          .query(`
            SELECT idTache, nom_tache, description_tache, date_debut_tache, date_fin_tache, idProjet, statut_tache
            FROM Taches
            WHERE idTache = @id;
          `);

        if (result.recordset.length === 0) {
          throw new Error("Tache not found");
        }

        return result.recordset[0];
      } catch (error) {
        console.error("Error fetching tache:", error);
        throw new Error("Error fetching tache");
      }
    }
  },

  Mutation: {
    createTache: async (
      _: any,
      { nom_tache, description_tache, date_debut_tache, date_fin_tache, statut_tache, idProjet }: { 
        nom_tache: string;
        description_tache: string;
        date_debut_tache: string;
        date_fin_tache?: string;
        statut_tache: 'TODO' | 'IN_PROGRESS' | 'END';
        idProjet: string;
      },
      { pool }: { pool: sql.ConnectionPool }
    ) => {
      try {
        // Validate that date_debut_tache is not in the past
        const currentDate = new Date();
        const dateDebut = new Date(date_debut_tache);

        if (dateDebut < currentDate) {
          throw new Error("date_debut_tache cannot be a past date.");
        }

        // Default time is set to the current time if not provided
        if (!date_debut_tache.includes("T")) {
          date_debut_tache = `${date_debut_tache}T${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
        }

        const idTache = uuidv4();

        // Log the query and data to track issues
        console.log("Creating tache with data:", {
          idTache, nom_tache, description_tache, date_debut_tache, date_fin_tache, statut_tache, idProjet
        });

        await pool.request()
          .input('idTache', sql.UniqueIdentifier, idTache)
          .input('nom_tache', sql.VarChar, nom_tache)
          .input('description_tache', sql.VarChar, description_tache)
          .input('date_debut_tache', sql.DateTime, date_debut_tache)
          .input('date_fin_tache', sql.DateTime, date_fin_tache || null)  // Use NULL if no date_fin_tache provided
          .input('statut_tache', sql.VarChar, statut_tache)
          .input('idProjet', sql.UniqueIdentifier, idProjet)
          .query(`
            INSERT INTO Taches (idTache, nom_tache, description_tache, date_debut_tache, date_fin_tache, statut_tache, idProjet)
            VALUES (@idTache, @nom_tache, @description_tache, @date_debut_tache, @date_fin_tache, @statut_tache, @idProjet);
          `);

        return {
          idTache,
          nom_tache,
          description_tache,
          date_debut_tache,
          date_fin_tache: date_fin_tache || null,
          statut_tache
        };
      } catch (error) {
        console.error("Error creating tache:", error);
        throw new Error("Error creating tache");
      }
    },

    updateTache: async (
      _: any,
      { id, nom_tache, description_tache, date_debut_tache, date_fin_tache, statut_tache }: {
        id: string;
        nom_tache?: string;
        description_tache?: string;
        date_debut_tache?: string;
        date_fin_tache?: string;
        statut_tache?: 'TODO' | 'IN_PROGRESS' | 'DONE';
      },
      { pool }: { pool: sql.ConnectionPool }
    ) => {
      try {
        // Validate that date_debut_tache is not in the past (only if it's provided)
        if (date_debut_tache) {
          const currentDate = new Date();
          const dateDebut = new Date(date_debut_tache);

          if (dateDebut < currentDate) {
            throw new Error("date_debut_tache cannot be a past date.");
          }
        }

        let query = 'UPDATE Taches SET ';
        const inputs: { name: string, type: any, value: any }[] = [];

        if (nom_tache) {
          query += 'nom_tache = @nom_tache, ';
          inputs.push({ name: 'nom_tache', type: sql.VarChar, value: nom_tache });
        }

        if (description_tache) {
          query += 'description_tache = @description_tache, ';
          inputs.push({ name: 'description_tache', type: sql.VarChar, value: description_tache });
        }

        if (date_debut_tache) {
          query += 'date_debut_tache = @date_debut_tache, ';
          inputs.push({ name: 'date_debut_tache', type: sql.DateTime, value: date_debut_tache });
        }

        if (date_fin_tache) {
          query += 'date_fin_tache = @date_fin_tache, ';
          inputs.push({ name: 'date_fin_tache', type: sql.DateTime, value: date_fin_tache });
        }

        if (statut_tache) {
          query += 'statut_tache = @statut_tache, ';
          inputs.push({ name: 'statut_tache', type: sql.VarChar, value: statut_tache });
        }

        query = query.slice(0, -2) + ' WHERE idTache = @id';
        inputs.push({ name: 'id', type: sql.UniqueIdentifier, value: id });

        const request = pool.request();
        inputs.forEach((input) => request.input(input.name, input.type, input.value));

        await request.query(query);

        // Return the updated Tache after the update
        const updatedTache = await pool.request()
          .input('id', sql.UniqueIdentifier, id)
          .query(`
            SELECT idTache, nom_tache, description_tache, date_debut_tache, date_fin_tache, statut_tache, idProjet
            FROM Taches
            WHERE idTache = @id;
          `);

        return updatedTache.recordset[0];
      } catch (error) {
        console.error("Error updating tache:", error);
        throw new Error("Error updating tache");
      }
    },

    deleteTache: async (_: any, { id }: { id: string }, { pool }: { pool: sql.ConnectionPool }) => {
      try {
        const result = await pool.request()
          .input('id', sql.UniqueIdentifier, id)
          .query('DELETE FROM Taches WHERE idTache = @id');

        return result.rowsAffected[0] > 0;
      } catch (error) {
        console.error("Error deleting tache:", error);
        throw new Error("Error deleting tache");
      }
    }
  }
};
