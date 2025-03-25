module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.ENUM('message', 'reply'),
      allowNull: false,
    },
    isPositive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['userId', 'contentId', 'contentType'],
      },
    ],
  });

  Rating.associate = (models) => {
    Rating.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Rating;
}; 