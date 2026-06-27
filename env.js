function validateEnvVariables(requiredVariables) {
	const missingVariables = requiredVariables.filter(variable => !process.env[variable]);
	if (missingVariables.length > 0) {
		throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
	}
}

module.exports = { validateEnvVariables };