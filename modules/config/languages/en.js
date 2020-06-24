import chalk from "chalk";
export default {
	questions : {
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
		moreConnections : "Do you need one more connection? "
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
		url : `Your URLs must match the following format.${chalk.bold.underline("(driver://username:password@host:port/database?options)")}`
	}
}