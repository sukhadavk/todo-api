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
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string' && user.email.trim().length > 0) {
					user.email = user.email.toLowerCase();
				}
			}
		}

	});
};