const chalk = require("chalk");
module.exports = {
	questions : {
		howImport: "How do you want to import the 'Node OBREMAP' module?",
		folder : "In which folder do you want to save your models?",
		name : "What name will the model have?",
		snakeCase : `Are the names of your tables and columns in 'snake case' ${chalk.bold.underline("(snake_case)")} or in 'camel case' ${chalk.bold.underline("(camelCase)")}?`,
		tableName : "What is the name of the table?",
		primaryKey : "What is the Primary Key of this table?",
		incrementing : "Is it self-increasing?",
		keyType : "What is the field type of your Primary Key '?",
		timestamps : `Do you want the created at and updated at dates ${chalk.bold.underline("(Timestamps)")} to be added automatically?`,
		dateFormat : `What format do you want for the created at and updated at dates ${chalk.bold.underline("(Check: https://momentjs.com/docs/#/displaying/format/)")}?`,
		createdAt : "What is the name of your created at field?",
		updatedAt : "What is the name of your updated at field?",
		connection : "What is the name of the database connection you want to use?",
		// CREATE CONNECTION
		setConnection : `The mentioned connection ${chalk.bold.underline("(#_CONNECTION_#)")} was not found or no database configuration was found. Do you want to configure it now? `,
		setDefaultConnection : `Do you want to configure database connection now?`,
		driver : "What driver do you want to work with? ",
		configFile : "Do you want to use the OBREMAP Configuration file? [RECOMMENDED]",
		multiConnections : "Will you configure multiple database connections? ",
		urlConfig : "Do you want to configure your connections using a connection URL? Note. You can use the connection URL creation wizard to create your URLs.",
		url : "Do you have a connection URL? If you select NO, the connection URL creation wizard will start.",
		connectionUrl : "Write your URL:",
		hostname : `Defines the server name or IP. ${chalk.bold.underline("(Ex. 127.0.0.1 or moccacoders.com)")} `,
		username : `Defines the connection username. ${chalk.bold.underline("(Eg root)")} `,
		password : "Define the database password ",
		database : "Defines the name of the database ",
		port : "Defines the port.",
		connectionName : "Define a name for this connection. ",
		moreConnections : "Do you need one more connection? ",
		forceFresh: "Do you really want to drop all tables?"
	},
	wizard : "CONNECTION URL CREATION WIZARD",
	connectionConfig : "DATABASE CONNECTION CONFIG",
	connectionEnv : "ENVIRONMENTAL VARIABLES FOR THE CONNECTION",
	connectionEnvMsg : "Add these variables to your environment file (.env) or to the environment variables of your cloud environment.",
	configFile: {
		created : `The ${chalk.bold("OBREMAP config file")} was ${chalk.green("CREATED")}:`,
		updated : `The ${chalk.bold("OBREMAP config file")} was ${chalk.keyword("orange")("UPDATED")}:`
	},
	model: {
		created : `The ${chalk.bold("OBREMAP model file")} was ${chalk.green("CREATED")}:`,
		updated : `The ${chalk.bold("OBREMAP model file")} was ${chalk.keyword("orange")("UPDATED")}:`
	},
	error : {
		url : `Your URLs must match the following format.${chalk.bold.underline("(driver://username:password@host:port/database?options)")}`,
		connectionName : `A connection configuration with the name ${chalk.bold.underline.keyword("orange")("(#_CONNECTION_NAME_#)")} already exists. Please use a different name.`,
	}
}