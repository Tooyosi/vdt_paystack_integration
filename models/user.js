/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null"
    },
    'username': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'password': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'last_login': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'user'
  });
};
