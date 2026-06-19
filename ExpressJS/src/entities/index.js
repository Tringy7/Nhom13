import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import process from 'process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const configPath = path.join(__dirname, '..', 'config', 'config.json');
const configRaw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configRaw)[env];

const db = {};

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(
      process.env[config.use_env_variable],
      config
  );
} else {
  sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
  );
}

const files = fs.readdirSync(__dirname).filter(file => {
  return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
  );
});

for (const file of files) {
  try {
    const filePath = path.join(__dirname, file);

    const importedModule = await import(
        pathToFileURL(filePath).href
        );

    const modelDefiner = importedModule.default;

    if (typeof modelDefiner !== 'function') {
      console.warn(
          `[WARN] ${file} does not export a default model function`
      );
      continue;
    }

    const model = modelDefiner(
        sequelize,
        Sequelize.DataTypes
    );

    db[model.name] = model;
  } catch (error) {
    console.error(
        `[ERROR] Failed to load model file: ${file}`,
        error
    );
  }
}

console.log('Loaded models:', Object.keys(db));

Object.keys(db).forEach(modelName => {
  if (typeof db[modelName].associate === 'function') {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;