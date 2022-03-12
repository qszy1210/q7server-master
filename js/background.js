chrome.commands.onCommand.addListener((command) => {
	console.log(`Command: ${command}`);
	if (command === 'open_url') {
		openUrlCurrentTab("http://localhost:3000/")
	}
});