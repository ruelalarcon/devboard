module.exports = (sequelize, DataTypes) => {
  const Reply = sequelize.define("Reply", {
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
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Messages",
        key: "id",
      },
    },
    parentReplyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Replies",
        key: "id",
      },
    },
  });

  Reply.associate = (models) => {
    Reply.belongsTo(models.User, {
      foreignKey: "userId",
      as: "author",
    });
    Reply.belongsTo(models.Message, {
      foreignKey: "messageId",
      as: "message",
    });
    Reply.belongsTo(models.Reply, {
      foreignKey: "parentReplyId",
      as: "parentReply",
    });
    Reply.hasMany(models.Reply, {
      foreignKey: "parentReplyId",
      as: "replies",
      onDelete: "CASCADE",
    });
    Reply.hasMany(models.Rating, {
      foreignKey: "contentId",
      as: "ratings",
      scope: {
        contentType: "reply",
      },
      onDelete: "CASCADE",
    });
  };

  return Reply;
};
