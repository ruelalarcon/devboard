const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/database")[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Load all model files and add them to the db object
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Create associations between models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Configure Sequelize to handle date serialization
if (!Sequelize.prototype.options) {
  Sequelize.prototype.options = {};
}

if (!Sequelize.prototype.options.dialectOptions) {
  Sequelize.prototype.options.dialectOptions = {};
}

Sequelize.prototype.options.dialectOptions = {
  ...Sequelize.prototype.options.dialectOptions,
  useUTC: true,
};

// Configure all models to convert dates to strings
Object.keys(db).forEach((modelName) => {
  if (db[modelName].prototype) {
    const originalToJSON =
      db[modelName].prototype.toJSON ||
      function () {
        return { ...this.get() };
      };

    db[modelName].prototype.toJSON = function () {
      const values = originalToJSON.call(this);

      // Convert timestamps to ISO strings
      if (values.createdAt) {
        values.createdAt =
          values.createdAt instanceof Date
            ? values.createdAt.toISOString()
            : values.createdAt;
      }
      if (values.updatedAt) {
        values.updatedAt =
          values.updatedAt instanceof Date
            ? values.updatedAt.toISOString()
            : values.updatedAt;
      }

      return values;
    };
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
