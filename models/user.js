var bcrypt = require('bcryptjs');
var _ = require('underscore');

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
		salt: {
			type: DataTpes.STRING
		},
		password_hash: {
			type: DataTpes.STRING
		},
		password: {
			type: DataTpes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string' && user.email.trim().length > 0) {
					user.email = user.email.toLowerCase();
				}
			}
		},
		instanceMethods:  {
			toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			}
		}

	});
};