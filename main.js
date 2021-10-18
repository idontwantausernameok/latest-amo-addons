const UPDATE_RATE = 30 * 60 * 1000; // 30 minutes (in ms)
const API_URL = "https://addons.mozilla.org/api/v3/addons/search/?sort=created&page_size=100&type=extension";

async function updateSidebar(aType) {

	//console.log('updateSidebar');
	try {

		const data = JSON.parse((await (async function (url){
			return new Promise( (resolve,reject) => {
				let xhr = new XMLHttpRequest();
				xhr.addEventListener("load", function() {
					switch (xhr.responseType){
						case '':
						case 'json':
						case 'text':
							resolve(xhr.responseText);
							return;
					}
					reject('invalid response type');
				});
				xhr.addEventListener("error", reject);
				xhr.open('GET', url);
				xhr.send();
			});
		})(API_URL)));

		let first = true;

		if (Array.isArray(data.results)) {

			let addonList = document.getElementById("addon-list");
			for (const addon of data.results) {
				try {
					if(
						addon.id 
					     && addon.url 
					     && addon.name 
					     && addon.name[addon.default_locale] 
					     && addon.last_updated 
					     && addon.icon_url 
					     && addon.summary 
					     && addon.summary[addon.default_locale]
					){
						// clear list on first new found
						if(first) {
							first = false;
							addonList.innerHTML = '';
						}
						addonList.appendChild(
							createAddonNode(
								{	
									"id": addon.id,
									"url": addon.url,
									"name": addon.name[addon.default_locale],
									"lastUpdated": addon.last_updated,
									"iconURL": addon.icon_url,
									"summary": addon.summary[addon.default_locale]
								}
							)
						)
					}
				} catch (e) {
					console.log(`Invalid post entry:\n${e}`);
				}
			}
		} 
	}catch(e){
		console.error(e);
	}
	setTimeout(updateSidebar, UPDATE_RATE);
}


function createAddonNode(addon) {
  let container = document.createElement("div");
  let imageContainer = document.createElement("div");
  let nameContainer = document.createElement("div");
  let metadataContainer = document.createElement("div");
  let image = document.createElement("img");
  let nameNode = document.createElement("a");
  let summaryNode = document.createElement("p");
  let lastUpdatedNode = document.createElement("p");
  const summaryText = formatSummary(addon.summary);
  const lastUpdatedText = "Last updated: " + formatDate(addon.lastUpdated);

  container.setAttribute("class", "addon-container");

  imageContainer.setAttribute("class", "image-container");
  image.setAttribute("src", addon.iconURL);

  imageContainer.appendChild(image);
  container.appendChild(imageContainer);

  nameContainer.setAttribute("class", "name-container");
  nameNode.setAttribute("class", "addon-name");
  nameNode.setAttribute("href", addon.url);

  nameContainer.appendChild(nameNode);
  container.appendChild(nameContainer);

  nameNode.appendChild(document.createTextNode(addon.name));
  summaryNode.setAttribute("class", "addon-summary");
  summaryNode.appendChild(document.createTextNode(summaryText));
  lastUpdatedNode.setAttribute("class", "last-updated");

  lastUpdatedNode.appendChild(document.createTextNode(lastUpdatedText));
  metadataContainer.setAttribute("class", "metadata-container");
  metadataContainer.appendChild(summaryNode);
  metadataContainer.appendChild(lastUpdatedNode);
  container.appendChild(metadataContainer);

  return container;
}

function formatSummary(text) {
  return text.replace(/\<[^<]+\>/g, "");
}

function formatDate(text) {
  return text.split("T")[0];
}

updateSidebar();
