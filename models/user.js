module.exports = function(sequelize, DataTpes) {
	return sequelize.define('user', {
		email: {
			type: DataTpes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTpes.STRING,
			allowNull: false,
			validate: {
				len: [7, 100]
			}
		}
	});
};