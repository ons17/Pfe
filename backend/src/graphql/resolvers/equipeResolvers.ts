import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

export const equipeResolvers = {
  Query: {
    equipes: async (_: any, __: any, { pool }: { pool: sql.ConnectionPool }) => {
      try {
        const result = await pool.request().query(`
          SELECT idEquipe, nom_equipe, description_equipe
          FROM Equipes;
        `);
        return result.recordset;
      } catch (error) {
        console.error("Error fetching equipes:", error);
        throw new Error("Error fetching equipes");
      }
    }
  },

  Equipe: {
    projets: async (parent: any, _: any, { pool }: { pool: sql.ConnectionPool }) => {
      try {
        const projectsResult = await pool.request()
          .input('idEquipe', sql.UniqueIdentifier, parent.idEquipe)
          .query(`
            SELECT p.idProjet, p.nom_projet, p.description_projet, p.date_debut_projet, p.date_fin_projet, p.statut_project
            FROM Projects p
            INNER JOIN ProjectEquipe pe ON p.idProjet = pe.idProjet
            WHERE pe.idEquipe = @idEquipe;
          `);

        return projectsResult.recordset || []; // Retourne une liste vide au lieu de `null`
      } catch (error) {
        console.error("Error fetching projets for equipe:", error);
        return []; // En cas d'erreur, retourne une liste vide
      }
    }
  },

  Mutation: {
    createEquipe: async (
      _: any,
      { nom_equipe, description_equipe }: { nom_equipe: string; description_equipe?: string },
      { pool }: { pool: sql.ConnectionPool }
    ) => {
      try {
        const idEquipe = uuidv4();

        await pool.request()
          .input('idEquipe', sql.UniqueIdentifier, idEquipe)
          .input('nom_equipe', sql.VarChar, nom_equipe)
          .input('description_equipe', sql.VarChar, description_equipe || '')
          .query(`
            INSERT INTO Equipes (idEquipe, nom_equipe, description_equipe)
            VALUES (@idEquipe, @nom_equipe, @description_equipe);
          `);

        return {
          idEquipe,
          nom_equipe,
          description_equipe,
        };
      } catch (error) {
        console.error("Error creating equipe:", error);
        throw new Error("Error creating equipe");
      }
    },

    updateEquipe: async (
  _: any,
  { id, nom_equipe, description_equipe }: {
    id: string;
    nom_equipe?: string;
    description_equipe?: string;
  },
  { pool }: { pool: sql.ConnectionPool }
) => {
  try {
    let query = 'UPDATE Equipes SET ';
    const inputs = [];

    if (nom_equipe) {
      query += 'nom_equipe = @nom_equipe, ';
      inputs.push({ name: 'nom_equipe', type: sql.VarChar, value: nom_equipe });
    }

    if (description_equipe) {
      query += 'description_equipe = @description_equipe, ';
      inputs.push({ name: 'description_equipe', type: sql.VarChar, value: description_equipe });
    }

    query = query.slice(0, -2) + ' WHERE idEquipe = @id';
    inputs.push({ name: 'id', type: sql.UniqueIdentifier, value: id });

    const request = pool.request();
    inputs.forEach((input) => request.input(input.name, input.type, input.value));
    await request.query(query);

    const updatedEquipe = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT idEquipe, nom_equipe, description_equipe
        FROM Equipes
        WHERE idEquipe = @id;
      `);

    return updatedEquipe.recordset[0];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating equipe:", error.message);
    } else {
      console.error("Error updating equipe:", error);
    }
    if (error instanceof Error) {
      throw new Error("Error updating equipe: " + error.message);
    } else {
      throw new Error("Error updating equipe: " + String(error));
    }
  }
},

    deleteEquipe: async (_: any, { id }: { id: string }, { pool }: { pool: sql.ConnectionPool }) => {
      try {
        const result = await pool.request()
          .input('id', sql.UniqueIdentifier, id)
          .query('DELETE FROM Equipes WHERE idEquipe = @id');

        if (result.rowsAffected[0] > 0) {
          return {
            success: true,
            message: "Equipe successfully deleted",
          };
        } else {
          return {
            success: false,
            message: "No equipe found with this ID",
          };
        }
      } catch (error) {
        console.error("Error deleting equipe:", error);
        throw new Error("Error deleting equipe");
      }
    },
  },
};