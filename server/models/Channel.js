module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define("Channel", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  });

  Channel.associate = (models) => {
    Channel.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
    Channel.hasMany(models.Message, {
      foreignKey: "channelId",
      as: "messages",
      onDelete: "CASCADE",
    });
  };

  return Channel;
};
