const chalk = require("chalk");
module.exports = {
	questions : {
		howImport: "¿De que manera quieres importar el módulo 'Node OBREMAP'?",
		folder : "En que carpeta deseas guardar tus modelos?",
		name : "¿Qué nombre tendrá el modelo?",
		snakeCase : `¿Los nombres de tus tablas y columnas estan en 'snake case' ${chalk.bold.underline("(snake_case)")} o en 'camel case' ${chalk.bold.underline("(camelCase)")}?`,
		tableName : "¿Cuál es el nombre de la tabla?",
		primaryKey : "¿Cuál es la Llave Primaria 'Primary Key' de esta tabla?",
		incrementing : "¿Es autoincrementable?",
		keyType : "¿Cuál es el tipo de campo de tu Llave Primaria 'Primary Key'?",
		timestamps : `¿Deseas que se agrege en automático las fechas de creación y edición ${chalk.bold.underline("(Timestamps)")}?`,
		dateFormat : `¿Qué formato deseas para las fechas de creación y edición ${chalk.bold.underline("(Revisar: https://momentjs.com/docs/#/displaying/format/)")}?`,
		createdAt : "¿Cuál es el nombre de tu campo de fecha de creación?",
		updatedAt : "¿Cuál es el nombre de tu campo de fecha de edición?",
		connection : "¿Cuál es el nombre de la conexión a base de datos que deseas utilizar?",
		// CREATE CONNECTION
		setConnection : `No se encontro la conexión mencionada ${chalk.bold.underline("(#_CONNECTION_#)")} o no se encontro configuración de base de datos. ¿Desea configurarla ahora?`,
		setDefaultConnection : `¿Desea configurar la conexión a base de datos ahora?`,
		configFile : "¿Deseas utilizar el archivo de Configuración OBREMAP? [RECOMENDADO]",
		multiConnections : "¿Configurarás multiples conexiones de base de datos?",
		urlConfig : "¿Deseas configurar tus conexiones mediante una URL de conexión? Nota. Puedes utilizar el asistente de creación de URL de conexión para crear tus URLs.",
		url : "¿Tienes una URL de conexión? Si seleccionas NO, se iniciará el asistente de creación de URL de conexión.",
		connectionUrl : "Escribe tu URL:",
		driver : "¿Con qué driver deseas trabajar?",
		hostname : `Define el nombre o IP de servidor. ${chalk.bold.underline("(Ej. 127.0.0.1 ó moccacoders.com)")}`,
		username : `Define el nombre de usuario de conexión. ${chalk.bold.underline("(Ej. root)")}`,
		password : "Define la contraseña de la base de datos",
		database : "Define el nombre de la base de datos",
		port : "Define el puerto.",
		connectionName : "Define un nombre para esta conexión.",
		moreConnections : "¿Necesitas una conexión más?",
		forceFresh: "Realmente deseas eliminar todas las tablas?"
	},
	wizard : "ASISTENTE DE CREACIÓN DE URL DE CONEXIÓN",
	connectionConfig : "CONFIGURACIÓN DE CONEXIÓN DE BASE DE DATOS",
	connectionEnv : "VARIABLES DE ENTORNO PARA LA CONEXIÓN",
	connectionEnvMsg : "Agrega estas variables a tu archivo de entorno (.env) o a las variables de entorno de tu ambiente en la nube.",
	configFile: {
		created : `El ${chalk.bold("archivo de Configuración OBREMAP")} ha sido ${chalk.green("CREADO")}:`,
		updated : `El ${chalk.bold("archivo de Configuración OBREMAP")} ha sido ${chalk.keyword("orange")("ACTUALIZADO")}:`,
	},
	model: {
		created : `El ${chalk.bold("archivo de Modelo OBREMAP")} ha sido ${chalk.green("CREADO")}:`,
		updated : `El ${chalk.bold("archivo de Modelo OBREMAP")} ha sido ${chalk.keyword("orange")("ACTUALIZADO")}:`,
	},
	error : {
		connectionName : `Ya existe una configuración de conexión con el nombre ${chalk.bold.underline.keyword("orange")("(#_CONNECTION_NAME_#)")}. Por favor, utiliza otro nombre.`,
		url : `Tus URLs deben coincidir con el siguiente formato. ${chalk.bold.underline("(driver://username:password@host:port/database?options)")}`
	}
}