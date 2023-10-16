function render() {
	// empty function
}

chrome.commands.onCommand.addListener((command) => {
	console.log(`Command: ${command}`);
	if (command === 'open_url') {
		openUrlCurrentTab("http://localhost:3000/")
	}
});

doGetServerList()

function filterServerList(searchKey) {
	return new Promise((resolve) => {
		chrome.storage.local.get({ allServers: [] }, function(items) {
			const result = []
			items.allServers.filter(s => {
				return s && s[0] && s[0].envName;
			}).sort((s1, s2) => {
				if (getNumber(s1[0].envName) == null) {
					return 999;
				}
				return getNumber(s1[0].envName) - getNumber(s2[0].envName);
			}).forEach(servers => {
				const filteredServer = searchKey && servers.filter(s => {
					const keys = searchKey.split(',');
					let contains = false;
					for (let index = 0; index < keys.length; index++) {
						const key = keys[index];
						// 只要顺序匹配即可
						const envname = s && s.envName;
						const reg = new RegExp(key.split('').join('.*'));
						if (reg.test(envname)) {
							contains = true;
							break;
						}
					}
					return contains;
				}) || servers;
				result.push(filteredServer)
			})
			resolve(result)
		})
	})
}



// 当用户的输入改变之后
// text 用户的当前输入
// suggest 调用suggest为用户提供搜索建议
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
	filterServerList(text).then(list => {
		suggest(list.reduce((result, subList) => {
			if (subList.length) {
				result.push({
					content: subList[0].domain,
					description: subList[0].envName
				})

				subList.forEach(item => {
					let serviceAddr = item.serviceAddr
					if (serviceAddr && serviceAddr.indexOf('http') === -1) {
						serviceAddr = "http://" + serviceAddr
					}
					result.push({
						content: serviceAddr,
						description: `${item.envName}${item.service}`
					})
				})
			}

			return result
		}, []))
	})
});

// 按下回车时事件，表示向插件提交了一个搜索
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
	if (text.match(/^http/)) {
		openUrlCurrentTab(text)
		// openUrlNewTab(text)
	}
});

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 当前标签打开某个链接
function openUrlCurrentTab(url)
{
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: url});
	})
}

// 新标签打开某个链接
function openUrlNewTab(url)
{
	chrome.tabs.create({url: url});
}
