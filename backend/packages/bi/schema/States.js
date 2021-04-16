cube(`State`, {
  sql: `SELECT * FROM public."Datum" where state is not null`,
  
  dimensions: {
    state: {
      sql: `state`,
      type: `string`
    },

    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true
    }
  },
  
  dataSource: `default`
});