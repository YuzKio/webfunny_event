//delete//
const moment = require('moment');
//delete//
const BuryPointCard = function (sequelize, DataTypes) {
  return sequelize.define('BuryPointCard', {
    // ID 主键
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // 页面id
    pageId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'pageId'
    },
    // 名称
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      field: 'name'
    },
    // 级别：卡片类型：1-柱状图，2-多折线，3-柱线图，4-堆叠图
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      field: 'type'
    },
    // 计算规则
    calcRule: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'calcRule'
    },
    // 创建人
    createBy: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'createBy'
    },
    // 修改人
    updateBy: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'updateBy'
    },
    // 创建时间
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    // 更新时间
    updatedAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  }, {
    // 如果为 true 则表的名称和 model 相同，即 user
    // 为 false MySQL创建的表名称会是复数 users
    // 如果指定的表名称本就是复数形式则不变
    freezeTableName: true
  })

}
//exports//
module.exports = BuryPointCard
//exports//