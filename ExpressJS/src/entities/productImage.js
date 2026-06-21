'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
        static associate(entities) {
            ProductImage.belongsTo(entities.Product, {
                foreignKey: 'productId',
                as: 'product'
            });
        }
    }
    ProductImage.init({
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ProductImage',
        tableName: 'productimages'
    });
    return ProductImage;
};