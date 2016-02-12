module.exports = function(sequelize, DataTpes) {
	return sequelize.define('todo', {
		description: {
			type: DataTpes.STRING,
			allowNull: false,
			validate: {
				len: [1, 250]
			}
		},
		completed: {
			type: DataTpes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
};