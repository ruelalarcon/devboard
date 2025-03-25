module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    screenshot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    channelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Channels",
        key: "id",
      },
    },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: "userId",
      as: "author",
    });
    Message.belongsTo(models.Channel, {
      foreignKey: "channelId",
      as: "channel",
    });
    Message.hasMany(models.Reply, {
      foreignKey: "messageId",
      as: "replies",
      onDelete: "CASCADE",
    });
    Message.hasMany(models.Rating, {
      foreignKey: "contentId",
      constraints: false,
      scope: {
        contentType: "message",
      },
      as: "ratings",
    });
  };

  return Message;
};
