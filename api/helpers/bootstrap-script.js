module.exports = {

  friendlyName: 'Run script',
  description: 'Ejecuta scripts dentro de api/scripts/',

  inputs: {
    name: { type: 'string', required: true }
  },

  fn: async function ({ name }) {
    const path = require('path');
    const scriptPath = path.resolve(process.cwd(), 'api/scripts', `${name}.js`);
    const script = require(scriptPath);

    if (script.fn) {
      return await script.fn();
    } else if (typeof script === 'function') {
      return await script();
    } else {
      throw new Error(`El script ${name} no tiene método ejecutable.`);
    }
  }
};
