const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

// Modelos
const Product = require('./models/Product');
const Category = require('./models/Category');
const Role = require('./models/Role');    
const User = require('./models/User'); 

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida');

        Category.hasMany(Product, { foreignKey: 'categoryId' });
        Product.belongsTo(Category, { foreignKey: 'categoryId' });

        Role.hasMany(User, { foreignKey: 'roleId' });
        User.belongsTo(Role, { foreignKey: 'roleId' });

        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados');

        const catCount = await Category.count();
        if (catCount === 0) {
            await Category.bulkCreate([
                { nombre: 'Electrónica' },
                { nombre: 'Ropa' },
                { nombre: 'Hogar' },
                { nombre: 'Deportes' }
            ]);
            console.log('Categorías creadas');
        }

        const roleCount = await Role.count();
        if (roleCount === 0) {
            await Role.bulkCreate([
                { nombre: 'ADMIN' },
                { nombre: 'CUSTOMER' }
            ]);
            console.log('Roles creados (ADMIN y CUSTOMER)');
        }

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();